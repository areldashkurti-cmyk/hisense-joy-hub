// Validate a submitted claim's invoice using Lovable AI Gemini vision.
// Reads the proof file from storage, asks Gemini to extract model #, sale date, and dealer,
// compares to the claim, and writes validation_status + validation_details back to the claim.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ValidationStatus = "valid" | "flagged" | "missing_invoice" | "error";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { claim_id } = await req.json();
    if (!claim_id || typeof claim_id !== "string") {
      return json({ error: "claim_id required" }, 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Auth: must be the claim owner or an admin
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return json({ error: "Unauthorized" }, 401);

    const { data: claim, error: cErr } = await admin
      .from("claims")
      .select("id, user_id, model_number, sale_date, customer_name, proof_path")
      .eq("id", claim_id)
      .maybeSingle();
    if (cErr || !claim) return json({ error: "Claim not found" }, 404);

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (claim.user_id !== userData.user.id && !roleRow) {
      return json({ error: "Forbidden" }, 403);
    }

    if (!claim.proof_path) {
      await writeStatus(admin, claim.id, "missing_invoice", { reason: "no proof_path" });
      return json({ status: "missing_invoice" });
    }
    if (!LOVABLE_API_KEY) {
      await writeStatus(admin, claim.id, "error", { reason: "LOVABLE_API_KEY not set" });
      return json({ status: "error" });
    }

    // Download proof
    const { data: blob, error: dlErr } = await admin.storage
      .from("proof-of-purchase")
      .download(claim.proof_path);
    if (dlErr || !blob) {
      await writeStatus(admin, claim.id, "missing_invoice", { reason: "download failed" });
      return json({ status: "missing_invoice" });
    }

    const mime = blob.type || guessMime(claim.proof_path);
    const buf = new Uint8Array(await blob.arrayBuffer());
    const b64 = base64(buf);
    const dataUrl = `data:${mime};base64,${b64}`;

    // Gemini via Lovable AI — structured output via tool call
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You read invoice / proof-of-purchase documents and extract structured data. Return null for any field you cannot confidently read.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the model number, sale/invoice date (YYYY-MM-DD), and dealer / store name from this proof of purchase.",
              },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_invoice_fields",
              description: "Return extracted invoice fields.",
              parameters: {
                type: "object",
                properties: {
                  model_number: { type: ["string", "null"] },
                  invoice_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
                  dealer: { type: ["string", "null"] },
                  notes: { type: ["string", "null"] },
                },
                required: ["model_number", "invoice_date", "dealer"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_invoice_fields" } },
      }),
    });

    if (aiRes.status === 429) {
      await writeStatus(admin, claim.id, "error", { reason: "rate_limited" });
      return json({ error: "Rate limited" }, 429);
    }
    if (aiRes.status === 402) {
      await writeStatus(admin, claim.id, "error", { reason: "credits_exhausted" });
      return json({ error: "Credits exhausted" }, 402);
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      await writeStatus(admin, claim.id, "error", { reason: "ai_error", detail: t.slice(0, 500) });
      return json({ error: "AI error" }, 500);
    }

    const aiJson = await aiRes.json();
    const args =
      aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let extracted: { model_number: string | null; invoice_date: string | null; dealer: string | null; notes?: string | null } = {
      model_number: null,
      invoice_date: null,
      dealer: null,
    };
    try {
      extracted = JSON.parse(args ?? "{}");
    } catch (_e) {
      // ignore
    }

    const mismatches: string[] = [];
    const norm = (s: string | null | undefined) =>
      (s ?? "").replace(/[\s\-_]/g, "").toUpperCase();
    if (extracted.model_number && norm(extracted.model_number) !== norm(claim.model_number)) {
      mismatches.push("model_number");
    }
    if (!extracted.model_number) mismatches.push("model_number_missing");
    if (extracted.invoice_date && claim.sale_date) {
      const d1 = new Date(extracted.invoice_date).getTime();
      const d2 = new Date(claim.sale_date).getTime();
      if (Math.abs(d1 - d2) > 1000 * 60 * 60 * 24 * 3) mismatches.push("date");
    }

    const status: ValidationStatus = mismatches.length === 0 ? "valid" : "flagged";

    await admin
      .from("claims")
      .update({
        validation_status: status,
        validation_details: { extracted, mismatches, ran_at: new Date().toISOString() },
        invoice_date: extracted.invoice_date ?? null,
        invoice_dealer: extracted.dealer ?? null,
      })
      .eq("id", claim.id);

    return json({ status, extracted, mismatches });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});

async function writeStatus(admin: ReturnType<typeof createClient>, id: string, status: ValidationStatus, details: unknown) {
  await admin
    .from("claims")
    .update({ validation_status: status, validation_details: details })
    .eq("id", id);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function guessMime(path: string) {
  const p = path.toLowerCase();
  if (p.endsWith(".pdf")) return "application/pdf";
  if (p.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

function base64(bytes: Uint8Array) {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}
