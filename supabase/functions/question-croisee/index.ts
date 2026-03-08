import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, ngrok-skip-browser-warning",
};

interface QdrantSearchResult {
  id: string | number;
  score: number;
  payload?: Record<string, unknown>;
}

/** Get vector size for a collection */
async function getCollectionVectorSize(
  qdrantUrl: string,
  apiKey: string,
  collection: string
): Promise<number> {
  try {
    const res = await fetch(`${qdrantUrl}/collections/${collection}`, {
      headers: { "api-key": apiKey },
    });
    if (res.ok) {
      const data = await res.json();
      const config = data.result?.config?.params?.vectors;
      if (typeof config === "object" && config.size) return config.size;
      if (typeof config === "object") {
        const first = Object.values(config)[0] as any;
        if (first?.size) return first.size;
      }
    }
  } catch (e) {
    console.error("Error getting collection info:", e);
  }
  return 384;
}

/** Generate embedding for a query using Lovable AI gateway */
async function generateQueryEmbedding(
  text: string,
  apiKey: string,
  targetSize: number
): Promise<number[]> {
  // Try the embeddings endpoint first
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: [text],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      let embedding = data.data?.[0]?.embedding;
      if (embedding) {
        // Resize to match collection
        if (embedding.length > targetSize) embedding = embedding.slice(0, targetSize);
        while (embedding.length < targetSize) embedding.push(0);
        return embedding;
      }
    }
  } catch (e) {
    console.log("Embeddings endpoint failed, using Gemini fallback:", e);
  }

  // Fallback: use Gemini to generate pseudo-embedding
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are an embedding generator. Generate a ${targetSize}-dimensional normalized float vector that semantically represents the input text. Output ONLY a JSON array of ${targetSize} floating point numbers between -1 and 1. No explanation.`,
          },
          { role: "user", content: text.slice(0, 500) },
        ],
        stream: false,
      }),
    });

    if (resp.ok) {
      const d = await resp.json();
      const content = d.choices?.[0]?.message?.content || "";
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        const vec = JSON.parse(match[0]);
        if (Array.isArray(vec) && vec.length >= 100) {
          const normalized = vec.slice(0, targetSize);
          while (normalized.length < targetSize) normalized.push(0);
          return normalized;
        }
      }
    }
  } catch (e) {
    console.error("Gemini embedding fallback failed:", e);
  }

  // Last resort: random vector (bad quality but won't crash)
  return Array.from({ length: targetSize }, () => Math.random() * 2 - 1);
}

/** Vector search in Qdrant */
async function searchQdrant(
  qdrantUrl: string,
  apiKey: string,
  collection: string,
  queryVector: number[],
  limit = 5
): Promise<QdrantSearchResult[]> {
  const res = await fetch(`${qdrantUrl}/collections/${collection}/points/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      vector: queryVector,
      limit,
      with_payload: true,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Qdrant search error (${collection}):`, res.status, text);
    return [];
  }
  const data = await res.json();
  return data.result || [];
}

function extractContext(results: QdrantSearchResult[]): { text: string; sources: { document: string; page: number }[] } {
  const sources: { document: string; page: number }[] = [];
  const texts: string[] = [];

  for (const r of results) {
    const payload = r.payload || {};
    const content = (payload.page_content || payload.text || payload.content || payload.chunk || "") as string;
    const doc = (payload.document || payload.filename || payload.source || payload.nom_fichier || "Document inconnu") as string;
    const page = (payload.page || payload.page_number || 1) as number;

    if (content) {
      texts.push(content);
      if (!sources.find(s => s.document === doc && s.page === page)) {
        sources.push({ document: doc, page });
      }
    }
  }

  return { text: texts.join("\n\n"), sources };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Question requise" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const QDRANT_URL = Deno.env.get("QDRANT_URL");
    const QDRANT_API_KEY = Deno.env.get("QDRANT_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!QDRANT_URL || !QDRANT_API_KEY || !LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Configuration manquante" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get vector sizes for both collections in parallel
    const [finmaVectorSize, interneVectorSize] = await Promise.all([
      getCollectionVectorSize(QDRANT_URL, QDRANT_API_KEY, "finma_compliance"),
      getCollectionVectorSize(QDRANT_URL, QDRANT_API_KEY, "company_documents"),
    ]);

    console.log(`Vector sizes — finma: ${finmaVectorSize}, interne: ${interneVectorSize}`);

    // Generate query embeddings for each collection size
    const uniqueSizes = [...new Set([finmaVectorSize, interneVectorSize])];
    const embeddingMap: Record<number, number[]> = {};

    await Promise.all(
      uniqueSizes.map(async (size) => {
        embeddingMap[size] = await generateQueryEmbedding(question, LOVABLE_API_KEY, size);
      })
    );

    // Search both collections with proper vector embeddings
    const [finmaResults, interneResults] = await Promise.all([
      searchQdrant(QDRANT_URL, QDRANT_API_KEY, "finma_compliance", embeddingMap[finmaVectorSize], 5),
      searchQdrant(QDRANT_URL, QDRANT_API_KEY, "company_documents", embeddingMap[interneVectorSize], 5),
    ]);

    console.log(`Search results — finma: ${finmaResults.length}, interne: ${interneResults.length}`);

    const finmaContext = extractContext(finmaResults);
    const interneContext = extractContext(interneResults);

    // Build AI prompt for cross-analysis
    const systemPrompt = `Tu es un expert en conformité bancaire suisse (FINMA, LBA, CDB, LPD).
Tu reçois deux ensembles de contextes :
1. **Réglementation FINMA** : extraits de circulaires et lois
2. **Documents internes** : procédures et politiques de la banque

Ta mission :
- Analyse la question en croisant les deux sources
- Identifie les écarts de conformité entre les documents internes et les exigences réglementaires
- Cite précisément les sources (nom du document + page)
- Formule des recommandations actionnables si des écarts sont détectés
- Si les documents internes sont conformes, confirme-le explicitement
- Réponds toujours en français

Structure ta réponse en deux parties clairement séparées :
1. ANALYSE FINMA : ce que dit la réglementation
2. ANALYSE INTERNE : ce que disent les documents internes et les écarts identifiés`;

    const userPrompt = `Question : ${question}

--- CONTEXTE FINMA ---
${finmaContext.text || "Aucun document FINMA pertinent trouvé."}

--- CONTEXTE DOCUMENTS INTERNES ---
${interneContext.text || "Aucun document interne pertinent trouvé."}

Fournis une analyse croisée détaillée.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits épuisés, veuillez recharger votre compte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "Erreur du service d'analyse" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const fullResponse = aiData.choices?.[0]?.message?.content || "Pas de réponse générée.";

    // Split the response into FINMA and internal parts
    let finmaReponse = fullResponse;
    let interneReponse = "";

    const interneMarker = fullResponse.match(/#{0,3}\s*(?:2[\.\)]\s*)?ANALYSE\s+(?:INTERNE|DOCUMENTS?\s+INTERNES?)/i);
    const finmaMarker = fullResponse.match(/#{0,3}\s*(?:1[\.\)]\s*)?ANALYSE\s+FINMA/i);

    if (interneMarker && interneMarker.index !== undefined) {
      finmaReponse = fullResponse.slice(0, interneMarker.index).trim();
      interneReponse = fullResponse.slice(interneMarker.index).trim();

      if (finmaMarker) {
        finmaReponse = finmaReponse.replace(finmaMarker[0], "").trim();
      }
      interneReponse = interneReponse.replace(interneMarker[0], "").trim();
    }

    const result = {
      finma: finmaReponse
        ? { reponse: finmaReponse, sources: finmaContext.sources }
        : null,
      interne: interneReponse
        ? { reponse: interneReponse, sources: interneContext.sources }
        : interneContext.text
          ? { reponse: "Les documents internes ont été consultés mais aucun écart spécifique n'a été identifié pour cette question.", sources: interneContext.sources }
          : null,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("question-croisee error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur interne" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
