// Supabase Edge Function: `extract`
//
// Replaces the deleted Next.js /api/extract route from PR #5. Holds the
// user's plaintext Anthropic key only briefly during a request.
// Architecture: docs/prd/04-llm-integration.md.
//
// Modes (one function, dispatched on body.mode):
//   - "validate": tiny test call (Haiku, max_tokens 5). Marks the key
//                 validated on success. PR B scope.
//   - "extract":  full vision extraction with forced tool use, prompt
//                 caching, and extraction_logs writes. PR C scope.
//                 Streaming is deferred to PR D when the confirm form
//                 needs progressive field rendering.
//
// Auth: caller must send Authorization: Bearer <user JWT>. The function
// uses the user's JWT context to call public.get_user_api_key, which is
// SECURITY DEFINER and trusts auth.uid().
//
// Deploy:
//   supabase functions deploy extract

import { createClient } from "npm:@supabase/supabase-js@2.105.1";
import Anthropic from "npm:@anthropic-ai/sdk@0.92.0";

// CORS: open origin is safe here because the function is gated by Bearer
// JWT auth (no cookies). If the auth model ever changes to cookie-based
// sessions, tighten this to specific origins or origin-per-deployment to
// avoid CSRF. Tracked as Risk #10 in docs/prd/04-llm-integration.md.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Strip anything that looks like an Anthropic key or a Supabase JWT from
// strings we send back to the client. Defensive — the SDK doesn't currently
// echo the key in error messages, but a future change or a logging line
// would silently leak it. Risk #5 in PRD 04 "Security risks & mitigations".
const SECRET_PATTERNS: RegExp[] = [
  /sk-ant-[A-Za-z0-9_-]+/g, // Anthropic API keys
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, // JWTs
];

function scrubSecrets(value: string): string {
  let out = value;
  for (const pat of SECRET_PATTERNS) {
    out = out.replace(pat, "[redacted]");
  }
  return out;
}

function scrubError(input: unknown): string {
  const message = input instanceof Error ? input.message : String(input);
  return scrubSecrets(message);
}

const VALIDATE_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_EXTRACT_MODEL = "claude-sonnet-4-6";
const ALLOWED_EXTRACT_MODELS = new Set([
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
]);
const RECIPE_PHOTOS_BUCKET = "recipe-photos";
const MAX_PHOTOS = 4;

type ValidateBody = { mode: "validate" };
type ExtractBody = {
  mode: "extract";
  photo_paths: string[];
  model?: string;
};
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
    return await handleExtract(userClient, supabaseUrl, userData.user.id, body);
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
    return json({ error: `vault read failed: ${scrubError(keyErr.message)}` }, 500);
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
    const status = (e as { status?: number })?.status ?? 502;
    return json({ error: `validation failed: ${scrubError(e)}`, upstream_status: status }, 400);
  }

  const { data: validatedAt, error: markErr } = await userClient.rpc(
    "mark_user_api_key_validated",
    { provider_in: "anthropic" },
  );
  if (markErr) {
    return json({ error: `validated upstream but DB stamp failed: ${scrubError(markErr.message)}` }, 500);
  }

  return json({ ok: true, model: VALIDATE_MODEL, validated_at: validatedAt, duration_ms: Date.now() - startedAt });
}

// ─── Extract ────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Given one or more photos of a recipe (printed cookbook page, screenshot, or handwriting), extract the recipe into the structured form defined by the extract_recipe tool.

Rules:
- Preserve the recipe's original units (don't convert).
- For each ingredient, parse quantity, unit, item, and any prep note ("sifted", "softened").
- Use only these unit values: tsp, tbsp, floz, cup, pint, quart, gallon, ml, l, oz, lb, g, kg, whole, clove, pinch, dash, slice, inch, cm, f, c. If the source uses something else (e.g., "can"), set quantity.value to the count, quantity.unit to "whole", and put the descriptor in note (e.g., "14-ounce can").
- For each ingredient, include the verbatim original text in raw.
- If items are grouped under section headings ("For the dough"), set the group field on each ingredient/step in that section.
- Steps should be plain prose, one logical step per array entry.
- If a field is not present in the source, omit it. Do not invent.
- If the photo is not a recipe, set confidence to "none" and emit minimal fields.`;

type ExtractToolInput = {
  title: string;
  source?: string;
  description?: string;
  default_servings: number;
  time_min?: number;
  ingredients: Array<{
    raw: string;
    item: string;
    quantity?: { value: number; unit: string };
    range?: { low: number; high: number; unit: string };
    note?: string;
    group?: string;
  }>;
  steps: Array<{ text: string; group?: string }>;
  notes?: string;
  confidence: "high" | "medium" | "low" | "none";
};

const UNIT_ENUM = [
  "tsp", "tbsp", "floz", "cup", "pint", "quart", "gallon", "ml", "l",
  "oz", "lb", "g", "kg",
  "whole", "clove", "pinch", "dash", "slice",
  "inch", "cm",
  "f", "c",
] as const;

const EXTRACT_TOOL = {
  name: "extract_recipe",
  description: "Extract a structured recipe from one or more photos.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Recipe title verbatim from the source." },
      source: { type: "string", description: "Free-form attribution (book, magazine, person)." },
      description: {
        type: "string",
        description: "One-paragraph editorial blurb if present (e.g., headnote in a cookbook). Omit if not in the source.",
      },
      default_servings: { type: "integer", minimum: 1, description: "As-written serving count." },
      time_min: { type: "integer", minimum: 1, description: "Total time in minutes if stated. Omit otherwise." },
      ingredients: {
        type: "array",
        items: {
          type: "object",
          properties: {
            raw: { type: "string", description: "Original ingredient text verbatim." },
            item: { type: "string", description: "Parsed item name without quantity (e.g., 'all-purpose flour')." },
            quantity: {
              type: "object",
              properties: {
                value: { type: "number" },
                unit: { type: "string", enum: UNIT_ENUM },
              },
              required: ["value", "unit"],
            },
            range: {
              type: "object",
              properties: {
                low: { type: "number" },
                high: { type: "number" },
                unit: { type: "string", enum: UNIT_ENUM },
              },
              required: ["low", "high", "unit"],
            },
            note: { type: "string", description: "Prep note (e.g., 'sifted', 'softened', '15-ounce can')." },
            group: { type: "string", description: "Section heading if any (e.g., 'For the dough')." },
          },
          required: ["raw", "item"],
        },
      },
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            text: { type: "string", description: "One logical step in plain prose." },
            group: { type: "string", description: "Section heading if any (e.g., 'Make the sauce')." },
          },
          required: ["text"],
        },
      },
      notes: { type: "string", description: "Author's notes or footnotes if present." },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low", "none"],
        description: "Self-assessed accuracy. 'none' means the photo wasn't a recipe.",
      },
    },
    required: ["title", "default_servings", "ingredients", "steps", "confidence"],
  },
};

async function handleExtract(
  userClient: ReturnType<typeof createClient>,
  supabaseUrl: string,
  userId: string,
  body: ExtractBody,
): Promise<Response> {
  const photoPaths = Array.isArray(body.photo_paths) ? body.photo_paths : [];
  if (photoPaths.length === 0) {
    return json({ error: "photo_paths must be a non-empty array of storage keys" }, 400);
  }
  if (photoPaths.length > MAX_PHOTOS) {
    return json({ error: `too many photos: ${photoPaths.length} (max ${MAX_PHOTOS})` }, 400);
  }
  const model = body.model ?? DEFAULT_EXTRACT_MODEL;
  if (!ALLOWED_EXTRACT_MODELS.has(model)) {
    return json({ error: `unsupported model: ${model}` }, 400);
  }

  const { data: apiKey, error: keyErr } = await userClient.rpc(
    "get_user_api_key",
    { provider_in: "anthropic" },
  );
  if (keyErr) {
    return json({ error: `vault read failed: ${scrubError(keyErr.message)}` }, 500);
  }
  if (!apiKey) {
    return json({ error: "no Anthropic key configured for this user" }, 400);
  }

  const photoUrls = photoPaths.map((p) =>
    `${supabaseUrl}/storage/v1/object/public/${RECIPE_PHOTOS_BUCKET}/${p}`,
  );

  const anthropic = new Anthropic({ apiKey: apiKey as string });
  const startedAt = Date.now();

  let response;
  try {
    response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      tools: [
        // Cast for Anthropic SDK — runtime shape matches but TS types
        // don't always enumerate cache_control on tool entries.
        { ...EXTRACT_TOOL, cache_control: { type: "ephemeral" } } as unknown as Anthropic.Tool,
      ],
      tool_choice: { type: "tool", name: "extract_recipe" },
      messages: [
        {
          role: "user",
          content: [
            ...photoUrls.map((url): Anthropic.ImageBlockParam => ({
              type: "image",
              source: { type: "url", url },
            })),
            {
              type: "text",
              text: photoPaths.length === 1
                ? "Extract the recipe shown in this photo."
                : `Extract the recipe shown across these ${photoPaths.length} photos (in order).`,
            },
          ],
        },
      ],
    });
  } catch (e) {
    const status = (e as { status?: number })?.status ?? 502;
    await logExtractionAttempt({
      userId, model, status: "error",
      errorCode: anthropicErrorCode(e),
      durationMs: Date.now() - startedAt,
      inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0,
    });
    return json({ error: `extraction failed: ${scrubError(e)}`, upstream_status: status }, 502);
  }

  const durationMs = Date.now() - startedAt;
  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "extract_recipe",
  );

  if (!toolUse) {
    await logExtractionAttempt({
      userId, model, status: "error",
      errorCode: "no_tool_use", durationMs,
      inputTokens: response.usage.input_tokens ?? 0,
      outputTokens: response.usage.output_tokens ?? 0,
      cacheReadTokens: (response.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0,
      cacheCreationTokens: (response.usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens ?? 0,
    });
    return json({
      error: "model did not produce a tool call",
      stop_reason: response.stop_reason,
    }, 502);
  }

  const extracted = toolUse.input as ExtractToolInput;

  await logExtractionAttempt({
    userId, model,
    status: "success", errorCode: null, durationMs,
    inputTokens: response.usage.input_tokens ?? 0,
    outputTokens: response.usage.output_tokens ?? 0,
    cacheReadTokens: (response.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0,
    cacheCreationTokens: (response.usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens ?? 0,
  });

  return json({
    ok: true,
    model: response.model,
    duration_ms: durationMs,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      cache_read_tokens: (response.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0,
      cache_creation_tokens: (response.usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens ?? 0,
    },
    recipe: extracted,
  });
}

function anthropicErrorCode(e: unknown): string {
  const status = (e as { status?: number })?.status;
  if (status === 401) return "auth";
  if (status === 429) return "rate_limit";
  if (status === 529) return "overloaded";
  if (typeof status === "number") return `http_${status}`;
  return "network";
}

async function logExtractionAttempt(args: {
  userId: string;
  model: string;
  status: "success" | "error";
  errorCode: string | null;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
}): Promise<void> {
  // Service role used here because public.extraction_logs has owner-select
  // RLS only — no insert policy. Per PRD 04: logs are written server-side,
  // read by owner.
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return; // best-effort logging
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  await admin.from("extraction_logs").insert({
    user_id: args.userId,
    model: args.model,
    input_tokens: args.inputTokens,
    output_tokens: args.outputTokens,
    cache_read_tokens: args.cacheReadTokens,
    cache_creation_tokens: args.cacheCreationTokens,
    duration_ms: args.durationMs,
    status: args.status,
    error_code: args.errorCode,
  });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json" },
  });
}
