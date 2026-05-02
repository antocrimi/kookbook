# LLM integration (BYO Anthropic key)

**Status:** draft
**Last updated:** 2026-04-30
**Owner:** Kaz

## Summary

Recipe extraction is powered by Claude vision models, called with the user's own Anthropic API key. This PRD specifies how that key is stored and decrypted, how the extraction call is structured, what the prompt looks like, how failures are handled, and how usage / cost is surfaced.

## User story

> As a user, I want to paste in my Anthropic API key once, never see it again, and have the app extract recipes using my own credits — so cost and data flow stay under my control.

## Architecture (data flow)

```
┌────────────┐   1. POST /api/extract        ┌────────────────────┐
│  Browser   │ ─────────────────────────────▶│  Next.js route     │
│ (capture)  │   { recipeDraftId, model }    │  handler (Node)    │
└────────────┘                                └────────┬───────────┘
                                                       │ 2. Fetch encrypted key
                                                       ▼
                                              ┌────────────────────┐
                                              │  Supabase Postgres │
                                              │   user_api_keys    │
                                              │   (RLS, encrypted) │
                                              └────────┬───────────┘
                                                       │ 3. Decrypt
                                                       ▼
                                              ┌────────────────────┐
                                              │   Anthropic API    │
                                              │  (vision, stream)  │
                                              └────────┬───────────┘
                                                       │ 4. SSE stream
┌────────────┐   5. Re-stream as SSE         ┌────────▼───────────┐
│  Browser   │ ◀──────────────────────────── │  Next.js route     │
│ (capture)  │                                │  handler           │
└────────────┘                                └────────────────────┘
```

The browser **never sees the API key**. The server is the only place plaintext exists, and only briefly during a request.

## Requirements

### Must have

- **Key onboarding.** First-run wizard (after sign-in) prompts the user for their Anthropic API key with a one-line explanation and a link to console.anthropic.com. The form validates the key by making a tiny test call (`max_tokens: 5`, "Say 'ok'") before saving. Invalid keys are rejected with a clear error.
- **Encrypted storage.** API keys live in `user_api_keys` table, encrypted at rest using **Supabase Vault** (pgsodium under the hood). One row per user per provider; for MVP, only `provider = 'anthropic'`. Plaintext key never returned to the browser via any API.
- **Server-side proxy route.** All Anthropic calls go through `/api/extract` (and any future LLM routes). The route fetches the encrypted key, decrypts it server-side via Vault, makes the upstream call, and streams the response back as SSE.
- **Streaming pass-through.** The server consumes Anthropic's SSE stream, parses for content deltas, and re-emits a normalized SSE stream to the browser. The browser decodes JSON deltas progressively to populate the capture form (see `02-capture.md`).
- **Structured output via tool use.** Extraction is implemented as a single forced tool call with a JSON-schema parameter matching our `Recipe` shape. Claude's tool use is the most reliable way to get a strict JSON object from a vision call. The model has no other tools available — `tool_choice: { type: "tool", name: "extract_recipe" }`.
- **Model selection.** Per-user setting: `default_model` (Sonnet 4.6 default, Haiku 4.5 alternate). The capture flow can override per-call (re-extract with a different model). No silent model fallback — if the chosen model errors, we surface the error.
- **Usage logging.** Every extraction call writes a row to `extraction_logs`: `user_id`, `model`, `input_tokens`, `output_tokens`, `cache_read_tokens`, `cache_creation_tokens`, `duration_ms`, `status`, `error_code`. **No prompt content, no photo bytes, no plaintext key** in logs.
- **Cost surface in settings.** Show "this month: 23 extractions, ~210K input tokens, ~12K output tokens, ~\$0.78 estimated" — computed from `extraction_logs` and current Anthropic public pricing (hardcoded constants, refreshed manually). Estimate, not invoice.

### Should have

- **Prompt caching** on the system prompt and tool schema (large, static). Cuts cost on every extraction after the first by ~90% on the cached portion. Anthropic's `cache_control: { type: "ephemeral" }` markers — see the `claude-api` skill notes.
- **Retry with backoff** on `429` (rate limit) and `529` (overloaded). Two retries, exponential backoff. Surface a retry indicator in the UI, not just a stalled stream.
- **Image preprocessing.** Downscale photos server-side (or client-side before upload) to ~2000px long edge, JPEG quality ~85. Vision models don't need higher resolution and we save tokens.
- **Per-call cost preview.** Before submitting, show "~\$0.02 estimated" using a rough heuristic: `(image_tokens × N_photos × input_rate) + (avg_recipe_output_tokens × output_rate)`. Image tokens for Claude vision: ~`(width × height) / 750`.

### Won't have (this round)

- **Multi-provider.** Only Anthropic. No abstraction, no provider switch, no OpenAI/Gemini key fields. Locked in `00-overview.md`.
- **Background extraction / cron jobs.** Every extraction is request-bound. No queue.
- **User-managed prompt overrides.** The system prompt is fixed in code. No "tweak the prompt" UI.
- **Server-side caching of extraction results across users.** Even if two users uploaded identical bytes, we re-extract — privacy, simplicity, and cache-key complexity are not worth the marginal savings.
- **Cost ceilings / budget alerts.** Anthropic's own dashboard owns budget. We surface usage, not enforcement.

## Schema

### `user_api_keys`

| field           | type                     | notes                                                       |
| --------------- | ------------------------ | ----------------------------------------------------------- |
| `id`            | `uuid`                   | primary key                                                 |
| `user_id`       | `uuid`                   | FK → `auth.users`. RLS: user reads/writes their own only.   |
| `provider`      | `text`                   | `'anthropic'` for MVP. Constrained enum.                    |
| `secret_id`     | `uuid`                   | FK → `vault.secrets.id`. The actual encrypted bytes.        |
| `last_validated_at` | `timestamptz`        | last successful test call timestamp                         |
| `created_at`    | `timestamptz`            |                                                             |
| `updated_at`    | `timestamptz`            |                                                             |

Unique constraint: `(user_id, provider)` — one key per provider per user.

### `extraction_logs`

| field                   | type           | notes                                       |
| ----------------------- | -------------- | ------------------------------------------- |
| `id`                    | `uuid`         |                                             |
| `user_id`               | `uuid`         | FK → `auth.users`. RLS.                     |
| `recipe_id`             | `uuid`         | nullable (failed extractions have no recipe) |
| `model`                 | `text`         | full Anthropic model id                     |
| `input_tokens`          | `int`          |                                             |
| `output_tokens`         | `int`          |                                             |
| `cache_read_tokens`     | `int`          | from prompt caching                         |
| `cache_creation_tokens` | `int`          |                                             |
| `duration_ms`           | `int`          |                                             |
| `status`                | `text`         | `'success' | 'error'`                       |
| `error_code`            | `text`         | nullable. Anthropic error type or `'timeout'` |
| `created_at`            | `timestamptz`  |                                             |

## Prompt shape (informational)

System prompt (cached):

```
You are a recipe extraction assistant. Given one or more photos of a recipe
(printed cookbook page, screenshot, or handwriting), extract the recipe into
the structured form defined by the `extract_recipe` tool.

Rules:
- Preserve the recipe's original units (don't convert).
- For each ingredient, parse quantity, unit, item, and any prep note ("sifted", "softened").
- If items are grouped under section headings ("For the dough"), set the
  `group` field on each ingredient/step in that section.
- Steps should be plain prose, one logical step per array entry.
- If a field is not present in the source, omit it. Do not invent.
- If the photo is not a recipe, return an empty `recipe_extracted` field
  with `confidence: "none"`.
```

Tool definition (cached):

```ts
{
  name: "extract_recipe",
  description: "Extract a structured recipe from photos.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      source: { type: "string" },
      default_servings: { type: "integer", minimum: 1 },
      ingredients: { type: "array", items: { /* matches Ingredient in 01-data-model.md */ } },
      steps: { type: "array", items: { /* matches Step */ } },
      notes: { type: "string" },
      confidence: { enum: ["high", "medium", "low", "none"] }
    },
    required: ["title", "ingredients", "steps", "default_servings", "confidence"]
  }
}
```

User message: text "Extract the recipe shown" + the photos as `image` content blocks.

The exact prompt and tool schema live in code; this PRD captures intent, not the source of truth.

## Error handling

| Error class                          | Behavior                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------- |
| `401` invalid key                    | Surface "Your Anthropic key looks invalid" with a link to settings. Don't auto-clear.     |
| `429` rate limit                     | Retry with backoff (2 attempts). On final failure, surface "Rate-limited — try again."    |
| `529` overloaded                     | Same retry strategy.                                                                       |
| Other 4xx                            | Surface message; offer "Edit manually" path.                                              |
| 5xx / network                        | Retry once. On failure, surface and offer manual fallback.                                |
| Tool call returns `confidence: none` | Treat as "no recipe found." Show original photo + "We couldn't extract a recipe — edit manually." |
| Stream truncated                     | Save partial extraction as a draft; surface "Extraction incomplete — review and complete." |

## Acceptance criteria

- [ ] An invalid Anthropic key entered during onboarding is rejected with a clear error before saving.
- [ ] After saving, the plaintext key is not retrievable through any API the browser can call. (Enforced by RLS + the absence of a "get my key" route.)
- [ ] Updating the key in settings replaces the old encrypted secret atomically. The old key is unrecoverable.
- [ ] Extraction calls hit `/api/extract` and never include the key in any browser-visible request or response.
- [ ] Each extraction call writes one `extraction_logs` row with token counts and duration. Failed calls log too, with `status='error'` and an `error_code`.
- [ ] Settings → Usage shows current month's call count and estimated cost.
- [ ] Streaming: the capture form's fields populate progressively during extraction, not after a single big response.
- [ ] On `401` from Anthropic, the user is directed to settings; the key is not silently cleared.
- [ ] System prompt and tool schema are marked with `cache_control: { type: "ephemeral" }`. Cache hits are visible in `extraction_logs.cache_read_tokens` for subsequent calls within the cache TTL.

## Open questions

- **Which encryption layer?** Supabase Vault (pgsodium-based, opinionated, simple) vs. app-level envelope encryption with a server-side master key (more portable, more code). Vault is the default unless we hit a limitation. Worth a quick verify-it-works spike before committing.
- **Cost estimate fidelity.** Static rates table (committed JSON, manual update on price changes) is the simplest path. Acceptable until Anthropic introduces metered tiers or volume discounts that complicate the math.
- **Image token estimation pre-call.** Anthropic publishes a formula (`(width × height) / 750` rounded up) — accurate enough for the cost preview. No upstream "dry run" exists.
- **Throttling behavior on user side.** If the user fires 10 extraction requests in parallel, do we serialize them server-side (queue per user), or pass-through and let Anthropic rate-limit? Pass-through for MVP — re-evaluate if Anthropic's rate limiting is too aggressive.
- **Key rotation cadence.** No forced rotation. User-driven only. Document in the user-facing help: "rotate your key periodically."

## Changelog

- 2026-04-30 — initial draft. Captured the architecture, key storage with Supabase Vault, server-side proxy, structured tool-use prompt, error handling, usage logging, and acceptance criteria.
