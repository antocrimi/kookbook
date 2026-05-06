// Supabase Edge Function: `extract`
//
// Replaces the deleted Next.js /api/extract route from PR #5. Holds the
// user's plaintext Anthropic key only briefly during a request.
// Architecture: docs/prd/04-llm-integration.md.
//
// Modes (one function, dispatched on body.mode):
//   - "validate": tiny test call (Haiku, max_tokens 5). Marks the key
//                 validated on success. PR B scope.
//   - "extract":  full vision extraction with streaming + tool use.
//                 Stub here, implemented in PR C.
//
// Auth: caller must send Authorization: Bearer <user JWT>. The function
// uses the user's JWT context to call public.get_user_api_key, which is
// SECURITY DEFINER and trusts auth.uid().
//
// Deploy:
//   supabase functions deploy extract --linked

import { createClient } from "npm:@supabase/supabase-js@2.105.1";
import Anthropic from "npm:@anthropic-ai/sdk@0.92.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VALIDATE_MODEL = "claude-haiku-4-5-20251001";

type ValidateBody = { mode: "validate" };
type ExtractBody = { mode: "extract"; photo_paths?: string[]; model?: string };
type Body = ValidateBody | ExtractBody;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  const auth = req.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return json({ error: "missing Authorization bearer token" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: "edge function misconfigured: SUPABASE_URL / SUPABASE_ANON_KEY missing" }, 500);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return json({ error: "invalid or expired token" }, 401);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  if (!body || typeof body !== "object" || !("mode" in body)) {
    return json({ error: "body.mode is required" }, 400);
  }

  if (body.mode === "validate") {
    return await handleValidate(userClient);
  }
  if (body.mode === "extract") {
    return json({ error: "extract mode not yet implemented (PR C)" }, 501);
  }

  return json({ error: `unknown mode: ${(body as { mode: string }).mode}` }, 400);
});

async function handleValidate(
  userClient: ReturnType<typeof createClient>,
): Promise<Response> {
  const { data: apiKey, error: keyErr } = await userClient.rpc(
    "get_user_api_key",
    { provider_in: "anthropic" },
  );
  if (keyErr) {
    return json({ error: `vault read failed: ${keyErr.message}` }, 500);
  }
  if (!apiKey) {
    return json({ error: "no Anthropic key configured for this user" }, 400);
  }

  const anthropic = new Anthropic({ apiKey: apiKey as string });
  const startedAt = Date.now();
  try {
    await anthropic.messages.create({
      model: VALIDATE_MODEL,
      max_tokens: 5,
      messages: [{ role: "user", content: "Say 'ok'." }],
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const status = (e as { status?: number })?.status ?? 502;
    return json({ error: `validation failed: ${message}`, upstream_status: status }, 400);
  }

  const { data: validatedAt, error: markErr } = await userClient.rpc(
    "mark_user_api_key_validated",
    { provider_in: "anthropic" },
  );
  if (markErr) {
    return json({ error: `validated upstream but DB stamp failed: ${markErr.message}` }, 500);
  }

  return json({ ok: true, model: VALIDATE_MODEL, validated_at: validatedAt, duration_ms: Date.now() - startedAt });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json" },
  });
}
