# Backlog

Working draft of tickets toward MVP, organized by epic. Each ticket has a stable ID so it can be referenced in commits/PRs and later promoted into a real kanban (Linear / GitHub Projects / etc.) without renumbering.

## Conventions

- **ID:** `<EPIC>-<n>` (e.g. `CAP-3`). Stable across moves.
- **Size:** `XS` (<1h) · `S` (a few hours) · `M` (~1 day) · `L` (multi-day).
- **PRD:** link back to the spec section that drove the ticket.
- **Deps:** other ticket IDs that must land first.
- **Status:** `backlog` (default) · `ready` (groomed) · `in-progress` · `review` · `done`.

The acceptance criteria here are intentionally short — the *real* AC live in the PRDs. This file is the work breakdown, not the spec.

---

## Recently shipped (anchor)

These were done before the backlog existed and are listed for context only:

- Monorepo scaffold (Next.js 16 + React 19 + Tailwind v4, pnpm workspaces).
- `@cuckoobook/ui` ported from immergine, all 30 components + Storybook + Vitest.
- Full PRD set (`docs/prd/00-05`).
- Local Supabase stack on `54521–54527` with initial schema migration (recipes, folders, tags, recipe_tags, user_api_keys, extraction_logs, user_preferences) and RLS.
- `@supabase/ssr` clients + `proxy.ts` route protection.
- Tracer-bullet pages: magic-link sign-in, `/recipes` list with add-test-recipe, `/test-extract` for the Anthropic vision call.

---

## MVP critical path

Bare minimum to ship a useful product:

1. **`INF-4` PhotoUpload component** → unblocks capture
2. **`CAP-1`–`CAP-7`** capture flow (extract + confirm + save)
3. **`AUT-1`–`AUT-4`** onboarding + encrypted key (replaces dev env-var)
4. **`VIE-1`–`VIE-6`** unit/scale logic + recipe view + scaler + toggle
5. **`ORG-1`–`ORG-3`** folder list + create/rename + move

Everything else is post-MVP polish.

6. **`COOK-1`–`COOK-8`** cooking mode (immersive view + voice + AI + timers)
7. **`DES-1`–`DES-3`** design system (typography, palette, animations)

---

## Epic: Foundations (`INF`)

Cross-cutting infrastructure that other epics depend on.

### INF-1 · Set up Vitest + Testing Library for `apps/web`
- **Size:** S · **PRD:** — · **Status:** backlog
- Right now only `@cuckoobook/ui` has tests. Add the harness for the app.
- AC: `pnpm --filter web test` runs and at least one smoke test (e.g. recipe list rendering with mocked Supabase) passes.

### INF-2 · GitHub Actions CI
- **Size:** M · **Deps:** INF-1 · **Status:** backlog
- Run `pnpm -r lint`, `check-types`, `build`, `test` on PRs to `main`. Cache pnpm store.
- AC: PRs show green/red checks; failed lint blocks merge.

### INF-3 · PWA manifest + icons + install affordance
- **Size:** M · **PRD:** [00 §Constraints](./prd/00-overview.md#constraints) · **Status:** backlog
- Web manifest, icon set (favicon + apple-touch + maskable), `<meta name="theme-color">`. Best-effort install prompt.
- AC: Lighthouse PWA audit passes core install criteria; "Add to Home Screen" works on iOS Safari and Android Chrome.

### INF-4 · Promote `PhotoUpload` to `@cuckoobook/ui`
- **Size:** M · **PRD:** [02 §Must have](./prd/02-capture.md#requirements) · **Status:** backlog
- File-and-camera input, multi-photo (up to N), preview thumbnails, reorder, remove, drag-drop on desktop. Wraps `<input type="file" capture="environment" multiple>`.
- AC: Component lives in `packages/ui/src/PhotoUpload/` with tests + stories. Drop-in replacement for the current `<input type="file">` on `/test-extract`.

### INF-5 · Promote `NumberStepper` to `@cuckoobook/ui`
- **Size:** S · **PRD:** [03 §UX shape](./prd/03-interactive-view.md#ux-shape-informational) · **Status:** backlog
- Increment/decrement buttons + direct number entry, configurable min/max/step, allows fractional values. For the serving scaler.
- AC: Component lives in `packages/ui/src/NumberStepper/`. Used by `VIE-5`.

### INF-6 · Spike: confirm Supabase Vault works in local stack
- **Size:** XS · **PRD:** [04 §Open questions](./prd/04-llm-integration.md#open-questions) · **Status:** backlog
- 30-min spike: try `vault.create_secret(...)` and `vault.decrypted_secrets` on the local stack. If it works, AUT-4 uses Vault. If not, AUT-4 falls back to app-level envelope encryption with a server-side master key.
- AC: A short writeup in `docs/prd/04-llm-integration.md` decides Vault vs envelope. Open question is closed.

### INF-7 · Project memory & PRD update workflow notes in CLAUDE.md
- **Size:** XS · **Status:** backlog
- Add a one-liner: "Update `docs/backlog.md` when a ticket starts/completes; commit message body mentions the ticket ID."
- AC: CLAUDE.md has the rule. Future commits reference ticket IDs.

---

## Epic: Auth & Onboarding (`AUT`)

PRD: [`05-auth-and-onboarding.md`](./prd/05-auth-and-onboarding.md)

### AUT-1 · Onboarding wizard scaffold + welcome screen
- **Size:** S · **Status:** backlog
- New route `/onboarding` with a 3-step wizard shell (progress dots, next/back). Step 1: welcome copy + continue.
- AC: First-time signed-in user without prefs is redirected to `/onboarding`. Returning users skip it.

### AUT-2 · Onboarding step: units preference
- **Size:** S · **Deps:** AUT-1 · **Status:** backlog
- Two-option toggle (Metric / Imperial), pre-selected from `navigator.language`. Persists to `user_preferences.units`.
- AC: Choice survives reload and is reflected in settings.

### AUT-3 · Onboarding step: Anthropic key entry + validation test call
- **Size:** M · **Deps:** AUT-1 · **Status:** backlog
- Paste field + "Validate & save" button. Validation makes a `max_tokens: 5` "say 'ok'" call. Invalid keys are rejected with a clear error.
- AC: Valid key persists (via AUT-4), invalid key shows error and isn't saved.

### AUT-4 · Encrypted key storage (Supabase Vault or envelope)
- **Size:** M · **PRD:** [04 §Must have](./prd/04-llm-integration.md#requirements) · **Deps:** INF-6 · **Status:** backlog
- Server-side encryption per the INF-6 decision. `user_api_keys.secret_id` populated. No plaintext key returned to the browser through any API.
- AC: Replacing a key atomically replaces the encrypted secret; old key is unrecoverable. RLS prevents cross-user access.

### AUT-5 · Settings page: profile, prefs, sign out
- **Size:** M · **Deps:** AUT-2, AUT-4 · **Status:** backlog
- `/settings` route. Shows email, units toggle, default-model toggle, masked key with "Replace" button, sign out.
- AC: Replacing a key revalidates and persists. Toggles are immediately reflected on the recipe view.

### AUT-6 · Settings: usage stats panel
- **Size:** S · **Deps:** AUT-5 · **PRD:** [04 §Must have](./prd/04-llm-integration.md#requirements) · **Status:** backlog
- "This month: N extractions, ~X tokens, ~$Y estimated." Reads from `extraction_logs`.
- AC: Numbers match a manual SQL count. Estimate uses a checked-in pricing constants file.

### AUT-7 · Account deletion (hard delete with double-confirm)
- **Size:** S · **PRD:** [05 §Should have](./prd/05-auth-and-onboarding.md#requirements) · **Status:** backlog
- Settings → "Delete my account." Type-to-confirm. Removes recipes/folders/tags/photos/key/auth user. No undo.
- AC: After deletion, signing in with the same email is a fresh signup.

### AUT-8 · Data export (JSON + photos zip)
- **Size:** M · **PRD:** [05 §Should have](./prd/05-auth-and-onboarding.md#requirements) · **Status:** backlog
- Settings → "Export everything." Generates a JSON file of recipes/folders/tags + a zip of photos.
- AC: Export round-trips into a valid backup (could in theory restore manually).

### AUT-9 · Capture is gated until key is set
- **Size:** XS · **Deps:** AUT-3 · **Status:** backlog
- The `/capture` entry shows "set up your Anthropic key" with a CTA to settings if no key is configured. Folder/list views are accessible without a key.
- AC: A user with no key can browse but not capture. Setting the key unlocks capture without a refresh.

---

## Epic: Capture (`CAP`)

PRD: [`02-capture.md`](./prd/02-capture.md)

### CAP-1 · Server-side prompt + tool schema for `extract_recipe`
- **Size:** M · **PRD:** [02 §Extraction call shape](./prd/02-capture.md#extraction-call-shape-informational), [04 §Prompt shape](./prd/04-llm-integration.md#prompt-shape-informational) · **Status:** backlog
- Define system prompt + tool input schema (matching the `Recipe` shape from PRD 01). Mark with `cache_control: ephemeral`.
- AC: Schema validates against `Ingredient` / `Step` types in code (shared TS types). Prompt + schema cached on subsequent calls (visible in `extraction_logs.cache_read_tokens`).

### CAP-2 · `/api/extract` v2: streaming + structured output + logging
- **Size:** M · **Deps:** CAP-1, AUT-4 · **PRD:** [04](./prd/04-llm-integration.md) · **Status:** backlog
- Replace tracer route. Reads encrypted key, streams Anthropic's SSE, re-emits a normalized SSE stream. Writes one `extraction_logs` row per call. Retries on 429/529 with backoff.
- AC: Browser sees fields populate progressively. Failed calls log `status='error'` with `error_code`.

### CAP-3 · Capture entry page (multi-photo upload)
- **Size:** M · **Deps:** INF-4 · **PRD:** [02 §UX shape](./prd/02-capture.md#ux-shape) · **Status:** backlog
- `/capture` route. Up to 4 photos, reorderable, removable. "Submit for extraction" CTA shows photo count + cost preview.
- AC: Mobile camera opens via `capture="environment"`. Cancel returns without saving.

### CAP-4 · Client-side image compression
- **Size:** S · **Deps:** CAP-3 · **PRD:** [02 §Should have](./prd/02-capture.md#requirements) · **Status:** backlog
- Long edge ~2000px JPEG, target <600KB. Use `<canvas>`-based downscale (no native `compress` yet).
- AC: Upload payload size reduced; visible in network panel.

### CAP-5 · Streaming extraction UI (progressive form fill)
- **Size:** M · **Deps:** CAP-2, CAP-3 · **Status:** backlog
- After submit, fields populate as the model emits them. Progress affordance ("Extracting — 12 ingredients so far").
- AC: User can see partial state, not just a spinner. Truncated stream falls back gracefully.

### CAP-6 · Confirm / edit form (also serves manual entry)
- **Size:** M · **PRD:** [02 §UX shape](./prd/02-capture.md#ux-shape) · **Status:** backlog
- Every field editable: title, source, default servings, ingredients (with structured `quantity`/`unit`/`item`/`note`/`group`), steps, tags, folder, notes.
- AC: Same form scaffolds work for AI-extracted (pre-filled) and manual (empty) flows. Folder picker has "+ New folder" inline.

### CAP-7 · Save flow: recipe + photos + tags atomically
- **Size:** S · **Deps:** CAP-6 · **Status:** backlog
- POST → uploads photos to `recipe-photos/{user_id}/{recipe_id}/`, inserts recipe row, upserts tags, inserts `recipe_tags` join rows. All in one server transaction.
- AC: Partial failures don't leave orphan photos / dangling rows.

### CAP-8 · Drafts (auto-save on abandon, drafts list, resume)
- **Size:** M · **PRD:** [02 §Must have](./prd/02-capture.md#requirements) · **Status:** backlog
- Navigating away mid-flow saves a `is_draft=true` recipe with whatever fields exist. Drafts list at `/recipes?filter=drafts`.
- AC: Resuming a draft loads the photos + partial extraction; saving sets `is_draft=false`.

### CAP-9 · Re-extract action with edit-loss warning
- **Size:** S · **Deps:** CAP-2, CAP-6 · **Status:** backlog
- Button on the confirm screen. If any field is edited, confirm dialog before replacing.
- AC: User can't accidentally lose edits. Optional model override (Sonnet ↔ Haiku) on retry.

### CAP-10 · Cost preview heuristic before submit
- **Size:** S · **Deps:** CAP-3 · **PRD:** [02 §Should have](./prd/02-capture.md#requirements) · **Status:** backlog
- "~3K input + ~1K output ≈ $0.02" using checked-in pricing constants and image-tokens formula.
- AC: Estimate is within 30% of actual `extraction_logs` rows in practice.

---

## Epic: Interactive view (`VIE`)

PRD: [`03-interactive-view.md`](./prd/03-interactive-view.md)

### VIE-1 · Unit conversion library (dimensional rounding tiers)
- **Size:** M · **PRD:** [03 §Conversion rules](./prd/03-interactive-view.md#conversion-and-rounding-rules) · **Status:** backlog
- Pure-logic module. Volume / weight / temperature tiers, "nice number" rounding, fraction glyphs.
- AC: Vitest suite covers tier crossovers, edge cases (0.05 tsp clamping, etc.), 50+ assertions.

### VIE-2 · Range and count scaling
- **Size:** S · **Deps:** VIE-1 · **Status:** backlog
- "1–2 cloves" scales both ends. "3 eggs" → "5 eggs (approximately)" never fractional.
- AC: Tested against PRD examples.

### VIE-3 · Temperature regex substitution
- **Size:** S · **Deps:** VIE-1 · **PRD:** [03 §Temperature substitution](./prd/03-interactive-view.md#temperature-substitution) · **Status:** backlog
- Conservative regex: only isolated values, skip ranges and gas marks. Wrap converted spans for styling.
- AC: Tested against curated step-text fixtures.

### VIE-4 · Recipe view page (groups, ingredients, steps)
- **Size:** M · **Deps:** VIE-1, INF-5 · **Status:** backlog
- `/recipes/[id]`. Renders group labels, ingredient list with structured rendering, ordered steps. Source / notes / photo collapsed.
- AC: A captured recipe round-trips: capture → save → view → matches expectations.

### VIE-5 · Live serving scaler
- **Size:** S · **Deps:** VIE-4, INF-5 · **Status:** backlog
- NumberStepper in the header. Default = `default_servings`. Re-renders quantities live (client state, not persisted).
- AC: Scaling 4 → 6 servings rescales every quantity and range visibly.

### VIE-6 · Live unit toggle from user prefs
- **Size:** S · **Deps:** VIE-1, AUT-2 · **Status:** backlog
- Setting in `/settings` flips the global preference; recipe view honors it on next render. No per-recipe override.
- AC: Switching units in settings reflects on the next-loaded recipe view without a refresh of the page.

### VIE-7 · Ingredient checklist (client session state)
- **Size:** XS · **Deps:** VIE-4 · **Status:** backlog
- Tap to toggle strike-through. Resets on reload.
- AC: State doesn't persist; obviously visual.

### VIE-8 · Edit mode (reuses CAP-6 form)
- **Size:** S · **Deps:** CAP-6, VIE-4 · **Status:** backlog
- Pencil icon enters edit, save persists, cancel reverts.
- AC: No drift between capture form and edit form (same component).

### VIE-9 · Wake lock on view
- **Size:** XS · **Deps:** VIE-4 · **Status:** backlog
- Request Screen Wake Lock when view is open, release on navigation away. Best-effort.
- AC: Phone screen doesn't dim during a 5-min idle on the view (verified manually on iOS / Android).

### VIE-10 · Print view stylesheet
- **Size:** S · **Deps:** VIE-4 · **Status:** backlog
- `@media print` rules: single column, no controls, current servings + units bake in.
- AC: Cmd-P produces a clean one-page recipe.

---

## Epic: Organization (`ORG`)

PRD: [`01-data-model.md`](./prd/01-data-model.md)

### ORG-1 · Folder list page
- **Size:** S · **Status:** backlog
- `/recipes` shows folders with counts. Clicking a folder filters the list.
- AC: Inbox is always present and unrenameable. Empty folders show.

### ORG-2 · Create / rename folder
- **Size:** S · **Deps:** ORG-1 · **Status:** backlog
- Inline create on the folder list and folder picker. Rename via long-press / kebab menu.
- AC: Inbox can't be renamed/deleted. Duplicate names rejected with an inline error.

### ORG-3 · Move recipe between folders
- **Size:** S · **Deps:** ORG-1 · **Status:** backlog
- Folder picker on the recipe view + list-row kebab.
- AC: Moving a recipe updates its `folder_id` and reflects in both source and destination folder counts.

### ORG-4 · Tag autocomplete + add
- **Size:** S · **Deps:** CAP-6 · **Status:** backlog
- Tag chip input with type-to-search over existing tags; new strings auto-create tags.
- AC: Typing an existing tag picks it; typing a new one creates and attaches it.

### ORG-5 · Search (title + ingredient text)
- **Size:** M · **Status:** backlog
- Top-bar search across the user's recipes. Use `pg_trgm` or `ilike` on title + concatenated ingredient text.
- AC: Searching "tomato" surfaces all recipes with tomato in title or ingredients.

---

## Epic: Cooking Mode (`COOK`)

PRD: [`06-cooking-mode.md`](./prd/06-cooking-mode.md)

### COOK-1 · Cooking mode shell (full-screen step carousel)
- **Size:** M · **PRD:** [06 §Must have](./prd/06-cooking-mode.md#requirements) · **Status:** backlog
- Full-screen view with high-contrast forest/cream palette. One step at a time, swipe to navigate. Step counter, group labels, close button.
- AC: Entering cooking mode shows step 1 full-screen; swiping navigates; "×" exits.

### COOK-2 · Voice navigation (Web Speech API)
- **Size:** M · **Deps:** COOK-1 · **Status:** backlog
- `SpeechRecognition` listener for "next step," "previous step," "repeat," "exit." Mic indicator. Graceful degradation on unsupported browsers.
- AC: Voice commands navigate steps on Chrome Android and Safari iOS. Hidden where unsupported.

### COOK-3 · Tap-to-read (browser TTS)
- **Size:** S · **Deps:** COOK-1 · **Status:** backlog
- Tapping step text reads it aloud via `SpeechSynthesis`. Speaker icon affordance. Stops on navigation.
- AC: Tapping reads the step; navigating away stops playback.

### COOK-4 · Inline timer detection + countdown
- **Size:** M · **Deps:** COOK-1 · **Status:** backlog
- Regex detects time expressions in step text. Renders tappable timer badges. Countdown overlay with audio alert on completion. Multiple concurrent timers in a floating strip.
- AC: "Simmer for 20 minutes" renders a badge; tapping starts a 20:00 countdown; alert sounds at 0:00.

### COOK-5 · AI chat overlay (`/api/cooking-chat`)
- **Size:** M · **Deps:** COOK-1, AUT-4 · **PRD:** [06 §AI chat](./prd/06-cooking-mode.md#ai-chat-call-shape) · **Status:** backlog
- "Ask AI" CTA opens slide-up overlay. Voice (Web Speech) or text input. Claude call via server proxy with full recipe context. Response as text on screen.
- AC: Asking "how much garlic?" returns the correct quantity from the ingredient list at current scale.

### COOK-6 · Ingredient reference panel
- **Size:** S · **Deps:** COOK-1, VIE-1 · **Status:** backlog
- Collapsible bottom panel showing all ingredients at current serving scale and unit preference.
- AC: Tap "Ingredients" chip → panel slides up with the full list. Tap to dismiss.

### COOK-7 · Wake lock + step progress dots
- **Size:** XS · **Deps:** COOK-1 · **Status:** backlog
- `navigator.wakeLock` on entry, release on exit. Dot indicators for step progress.
- AC: Screen doesn't dim during idle. Dots reflect position.

### COOK-8 · "Cook" CTA on recipe view
- **Size:** XS · **Deps:** COOK-1, VIE-4 · **Status:** backlog
- Bottom-anchored "Cook" button on the recipe view page. Enters cooking mode for that recipe.
- AC: Button is visible and thumb-reachable on mobile. Tap enters cooking mode at step 1.

---

## Epic: Design System (`DES`)

PRD: [`docs/design-direction.md`](./design-direction.md)

### DES-1 · Typography: integrate "The Seasons" + update theme
- **Size:** S · **Status:** backlog
- Add Adobe Fonts `<link>` to `app/layout.tsx`. Add `the-seasons` as the serif token in `@cuckoobook/ui` theme. Define usage rules (headings: serif, body: sans).
- AC: Recipe titles render in "The Seasons." Body text remains in system sans. Storybook reflects the change.

### DES-2 · Color palette: forest/cream/coral/mustard tokens
- **Size:** S · **Deps:** DES-1 · **Status:** backlog
- Add new color tokens to `_themes.scss` / `_variables.scss`. `theme-cooking` variant for dark forest-green mode. Update existing components that reference old colors.
- AC: `data-theme="theme-cooking"` applies forest bg + cream text. Coral and mustard available as accent tokens.

### DES-3 · Animation foundations: Framer Motion + spring config
- **Size:** M · **Status:** backlog
- Add `framer-motion` to `apps/web`. Define shared spring configs (standard, snappy, dramatic). Card press animation. Ingredient check-off line-draw. Serving scaler odometer.
- AC: Recipe list cards have press feedback. At least 3 micro-interactions implemented per design-direction.md.

---

## Out-of-MVP backlog (parking lot)

Things from PRDs explicitly deferred or surfaced as post-MVP:

- **Grocery list:** in-app checklist with ingredient aggregation, Apple Reminders sync via Capacitor (PRD 07).
- **Shop integration:** Amazon Fresh / Instacart deep linking for ingredient ordering (PRD 08).
- **Sharing:** read-only public link per recipe (PRD 00).
- **Paste-URL ingestion:** scrape recipe from a blog URL (PRD 00).
- **Paste-text ingestion:** ingest raw text from notes app (PRD 00).
- **Volume↔weight conversion** with ingredient density (PRD 00 / 03).
- **Native shell** via Capacitor (PRD 00) — prerequisite for grocery list Reminders sync.
- **OAuth providers** (Google, Apple) for sign-in (PRD 05).
- **Soft-delete grace period** for accounts (PRD 05).
- **Multi-provider LLM** abstraction (PRD 04).
- **Multiple photos per recipe** (PRD 01).
- **Nutrition / ratings / "made N times"** (PRD 01).
