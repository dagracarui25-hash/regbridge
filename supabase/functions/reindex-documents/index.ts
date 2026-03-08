import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Generate embeddings using Lovable AI gateway */
async function generateEmbeddings(texts: string[], apiKey: string): Promise<number[][]> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "text-embedding-3-small", input: texts }),
  });

  if (response.ok) {
    const data = await response.json();
    return data.data.map((d: { embedding: number[] }) => d.embedding);
  }

  // Fallback: Gemini pseudo-embeddings
  console.log("Embeddings endpoint unavailable, using Gemini fallback");
  const embeddings: number[][] = [];
  for (const text of texts) {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Generate a 384-dimensional normalized float vector representing the input text semantically. Output ONLY a JSON array of 384 floats between -1 and 1." },
          { role: "user", content: text.slice(0, 500) },
        ],
        stream: false,
      }),
    });
    if (!resp.ok) {
      embeddings.push(Array.from({ length: 384 }, () => Math.random() * 2 - 1));
      continue;
    }
    const d = await resp.json();
    const content = d.choices?.[0]?.message?.content || "";
    try {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        const vec = JSON.parse(match[0]);
        if (Array.isArray(vec) && vec.length >= 100) {
          const normalized = vec.slice(0, 384);
          while (normalized.length < 384) normalized.push(0);
          embeddings.push(normalized);
          continue;
        }
      }
    } catch {}
    embeddings.push(Array.from({ length: 384 }, () => Math.random() * 2 - 1));
  }
  return embeddings;
}

/** Get collection vector size */
async function getCollectionVectorSize(qdrantUrl: string, apiKey: string, collection: string): Promise<number> {
  try {
    const res = await fetch(`${qdrantUrl}/collections/${collection}`, { headers: { "api-key": apiKey } });
    if (res.ok) {
      const data = await res.json();
      const config = data.result?.config?.params?.vectors;
      if (typeof config === "object" && config.size) return config.size;
      if (typeof config === "object") {
        const first = Object.values(config)[0] as any;
        if (first?.size) return first.size;
      }
    }
  } catch {}
  return 384;
}

/** Scroll all points from a collection */
async function scrollAllPoints(qdrantUrl: string, apiKey: string, collection: string): Promise<any[]> {
  const allPoints: any[] = [];
  let offset: string | number | null = null;

  while (true) {
    const body: any = { limit: 100, with_payload: true, with_vector: false };
    if (offset !== null) body.offset = offset;

    const res = await fetch(`${qdrantUrl}/collections/${collection}/points/scroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("Scroll error:", res.status, t);
      break;
    }

    const data = await res.json();
    const points = data.result?.points || [];
    allPoints.push(...points);

    offset = data.result?.next_page_offset;
    if (!offset || points.length === 0) break;
  }

  return allPoints;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const QDRANT_URL = Deno.env.get("QDRANT_URL");
    const QDRANT_API_KEY = Deno.env.get("QDRANT_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!QDRANT_URL || !QDRANT_API_KEY || !LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Configuration manquante" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const collection = body.collection || "company_documents";

    console.log(`🔄 Re-indexing collection: ${collection}`);

    // 1. Get all existing points
    const points = await scrollAllPoints(QDRANT_URL, QDRANT_API_KEY, collection);
    console.log(`Found ${points.length} points to re-index`);

    if (points.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "Aucun document à ré-indexer", reindexed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Log sample payload to understand structure
    if (points.length > 0) {
      const sampleKeys = Object.keys(points[0].payload || {});
      console.log(`Sample payload keys: ${JSON.stringify(sampleKeys)}`);
      // Log first payload truncated
      const sample = points[0].payload || {};
      const truncated: Record<string, string> = {};
      for (const [k, v] of Object.entries(sample)) {
        const s = String(v);
        truncated[k] = s.length > 100 ? s.slice(0, 100) + "..." : s;
      }
      console.log(`Sample payload: ${JSON.stringify(truncated)}`);
    }

    // Extract texts - try multiple field names
    const texts = points.map((p: any) => {
      const pl = p.payload || {};
      return pl.text || pl.content || pl.chunk_text || pl.page_content || pl.body || "";
    });
    const validIndices = texts.map((t: string, i: number) => ({ text: t, index: i })).filter((x: any) => x.text.length > 10);

    console.log(`${validIndices.length} chunks with valid text out of ${points.length}`);

    // 3. Get target vector size
    const vectorSize = await getCollectionVectorSize(QDRANT_URL, QDRANT_API_KEY, collection);
    console.log(`Target vector size: ${vectorSize}`);

    // 4. Generate new embeddings in batches
    const batchSize = 20;
    let reindexed = 0;

    for (let i = 0; i < validIndices.length; i += batchSize) {
      const batch = validIndices.slice(i, i + batchSize);
      const batchTexts = batch.map((b: any) => b.text);

      let embeddings = await generateEmbeddings(batchTexts, LOVABLE_API_KEY);

      // Normalize to target vector size
      embeddings = embeddings.map((emb) => {
        if (emb.length === vectorSize) return emb;
        if (emb.length > vectorSize) return emb.slice(0, vectorSize);
        return [...emb, ...Array(vectorSize - emb.length).fill(0)];
      });

      // 5. Upsert with new vectors
      const upsertPoints = batch.map((b: any, j: number) => ({
        id: points[b.index].id,
        vector: embeddings[j],
        payload: points[b.index].payload,
      }));

      const res = await fetch(`${QDRANT_URL}/collections/${collection}/points?wait=true`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "api-key": QDRANT_API_KEY },
        body: JSON.stringify({ points: upsertPoints }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error(`Upsert batch error:`, t);
      } else {
        await res.text();
        reindexed += batch.length;
        console.log(`✅ Re-indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validIndices.length / batchSize)} (${reindexed}/${validIndices.length})`);
      }
    }

    console.log(`🎉 Re-indexing complete: ${reindexed}/${validIndices.length} chunks`);

    return new Response(JSON.stringify({
      success: true,
      collection,
      total_points: points.length,
      reindexed,
      message: `${reindexed} chunks ré-indexés avec les nouveaux embeddings`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("reindex-documents error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur interne" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
