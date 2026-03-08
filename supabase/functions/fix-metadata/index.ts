import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Extract document name from any payload structure */
function extractDocumentName(payload: Record<string, unknown>): string | null {
  // Direct fields
  for (const key of ["document", "filename", "nom_fichier", "file_name", "name", "title"]) {
    const val = payload[key];
    if (val && typeof val === "string" && val.length > 0 && val !== "Document inconnu") {
      return val;
    }
  }

  // Source field (path style)
  if (payload.source && typeof payload.source === "string" && payload.source !== "regbridge-upload") {
    const parts = String(payload.source).replace(/\\/g, "/").split("/");
    const last = parts[parts.length - 1];
    if (last && last.length > 0) return last;
  }

  // Nested metadata (LangChain/Colab style)
  const meta = payload.metadata;
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    const m = meta as Record<string, unknown>;
    for (const key of ["source", "filename", "file_name", "document", "title", "name", "nom_fichier"]) {
      const val = m[key];
      if (val && typeof val === "string" && val.length > 0) {
        const parts = String(val).replace(/\\/g, "/").split("/");
        return parts[parts.length - 1] || String(val);
      }
    }
  }

  return null;
}

/** Scroll all points */
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

    if (!res.ok) break;
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

    if (!QDRANT_URL || !QDRANT_API_KEY) {
      return new Response(JSON.stringify({ error: "Configuration manquante" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const collection = body.collection || "company_documents";

    console.log(`🔧 Fixing metadata for collection: ${collection}`);

    const points = await scrollAllPoints(QDRANT_URL, QDRANT_API_KEY, collection);
    console.log(`Found ${points.length} points`);

    if (points.length > 0) {
      const sample = points[0].payload || {};
      console.log(`Sample keys: ${JSON.stringify(Object.keys(sample))}`);
      // Log metadata structure
      if (sample.metadata) {
        const metaKeys = typeof sample.metadata === "object" ? Object.keys(sample.metadata) : ["(not object)"];
        console.log(`Metadata keys: ${JSON.stringify(metaKeys)}`);
        if (typeof sample.metadata === "object") {
          const m = sample.metadata as Record<string, unknown>;
          for (const [k, v] of Object.entries(m)) {
            console.log(`  metadata.${k} = ${String(v).slice(0, 120)}`);
          }
        }
      }
    }

    // Build set_payload updates in batches
    let fixed = 0;
    let alreadyOk = 0;
    const batchSize = 100;

    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      const updates: { id: string | number; payload: Record<string, string> }[] = [];

      for (const p of batch) {
        const pl = p.payload || {};
        const currentDoc = pl.document || pl.filename || pl.nom_fichier;

        if (currentDoc && currentDoc !== "Document inconnu") {
          alreadyOk++;
          continue;
        }

        const name = extractDocumentName(pl);
        if (name) {
          updates.push({
            id: p.id,
            payload: { document: name, filename: name, nom_fichier: name },
          });
        }
      }

      if (updates.length === 0) continue;

      // Use set_payload API (no vector needed)
      for (const update of updates) {
        const res = await fetch(
          `${QDRANT_URL}/collections/${collection}/points/payload?wait=true`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "api-key": QDRANT_API_KEY },
            body: JSON.stringify({
              payload: update.payload,
              points: [update.id],
            }),
          }
        );
        if (res.ok) {
          await res.text();
          fixed++;
        } else {
          const t = await res.text();
          console.error(`set_payload error for ${update.id}:`, t);
        }
      }

      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: fixed ${updates.length} points`);
    }

    console.log(`🎉 Done: ${fixed} fixed, ${alreadyOk} already OK, ${points.length} total`);

    return new Response(JSON.stringify({
      success: true,
      collection,
      total_points: points.length,
      fixed,
      already_ok: alreadyOk,
      message: `${fixed} documents corrigés, ${alreadyOk} déjà OK`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fix-metadata error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur interne" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
