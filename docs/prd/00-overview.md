# Overview

**Status:** draft
**Last updated:** 2026-04-30

## Problem

Recipes I care about live in too many places: physical cookbooks, screenshots from blogs, notes app scribbles, photos of a friend's handwritten card. When I actually want to cook, I'm hunting across surfaces, doing mental unit conversions, and scaling 4-serving recipes for 2 people on the back of an envelope.

I want a single personal collection where:

- Capturing a recipe from a cookbook page is as easy as snapping a photo.
- The recipe shows up as structured, interactive data — not just an image I have to re-read.
- Measurements adapt to me (metric/imperial, my preferred serving size).
- Organization matches how I think — my own folders, my own taxonomy.

## Goals

1. **Capture is friction-free.** From "I see a recipe I want" to "it's saved in my collection" in under a minute. Photo → AI extraction → confirm → done.
2. **The recipe is interactive, not static.** Toggle units, change servings, and every quantity recalculates instantly. No re-reading, no mental math.
3. **It's mine.** I organize my recipes my way (folders), and I bring my own LLM credentials so cost and data flow stay under my control.
4. **It works on the phone.** Capture happens in the kitchen or at a friend's house, not at a desk.

## Non-goals (MVP)

- **Social / discovery.** No public feed, no recipe marketplace, no "recipes near you."
- **Meal planning, grocery lists, shopping integrations.** Tempting, but separate product surface.
- **Cooking-mode features.** No timers, step-by-step voice, hands-free mode. Possible later.
- **Nutrition analysis.** Calorie/macro calc requires a separate ingredient database; out of scope for MVP.
- **Multi-user collaboration.** No shared collections, no editing-with-others. Sharing read-only links is post-MVP (see Sharing below).
- **Generative recipes.** No "invent a dish from these ingredients." We're capturing recipes, not creating them.

## Users & use cases

**Primary:** the owner of the collection (single user, possibly a household of two using one account). Patterns:

- *Capture in the wild* — at a bookstore / friend's place, phone-only, fast.
- *Cook from collection* — in the kitchen, scaled to tonight's serving count, in my preferred units.
- *Browse / search* — Sunday planning, "what did I save with chicken?"

**Post-MVP secondary:** people I share an individual recipe with via link. Read-only, no account required.

## Key capabilities

1. **AI photo ingestion.** Snap → vision model extracts structured recipe → I confirm/edit → saved.
2. **Interactive recipe view.** Live unit toggle (metric/imperial), live serving scaler, ingredient checklist while cooking.
3. **My own organization.** User-defined folders/collections. Search across the whole library.
4. **BYO LLM credentials.** I bring my own Anthropic API key (and possibly other providers later); the app never charges me for tokens.
5. **(Post-MVP) Sharing.** Generate a read-only link for a single recipe.

## Constraints

- **BYO LLM tokens.** No central LLM cost on us. Trade-off: the user has to set up an API key before capture works. Storage of that key needs care.
- **Mobile capture is non-negotiable.** Web app must work well on phone — this is where capture happens. Desktop is for browsing / cleanup.
- **Personal scale, not enterprise.** Hundreds-to-low-thousands of recipes per user, not millions. Don't over-engineer search/storage.

## Success metrics

- **Capture funnel:** photo taken → recipe saved (target: > 80% complete; < 60s median).
- **Extraction quality:** % of recipes saved without manual edits (target: > 60% for printed cookbook pages).
- **Adoption:** recipes captured per active week (proxy for "is this actually useful to me").
- **Retention:** weekly cooking sessions (open a saved recipe in cook mode) — the real signal.

## Decisions locked (2026-04-30)

- **Storage / auth:** server-backed with accounts. Postgres + object storage + auth (provider TBD — strong default: Supabase, since it gives all three in one). Sync across devices, photos in object storage, sharing-via-link works naturally post-MVP.
- **MVP ingestion:** **photo only** (camera + upload). Paste-URL and paste-text deferred to post-MVP. Manual edit form will exist anyway as the edit screen for AI-extracted recipes.
- **Organization:** **folders + tags.** Each recipe has exactly one home folder. Tags are a separate dimension, multi-valued. Flat folders only — no nesting in MVP.
- **Unit conversion:** **dimensional only.** Convert within volume, within weight, within temperature. Don't attempt volume↔weight (no density inference) — that's post-MVP.
- **Servings scaling:** linear scaling of ingredient quantities only. Times, temperatures, and pan sizes are passed through unchanged. (Cooking times don't scale linearly; promising they do is worse than not promising.)

## Decisions locked (continued, 2026-04-30)

- **Backend platform:** **Supabase** — Auth + Postgres + Storage in one. Row-level security for per-user data isolation. Storage bucket for original capture photos.
- **Auth method:** **magic link** (email) for MVP. Google OAuth is a fast follow if friction shows up; both supported by Supabase out of the box.
- **LLM key handling:** stored **server-side, encrypted at rest**. Decrypted only at call time on a Next.js route handler. Browser never sees the key. Enables observability, key rotation, future server-side features (e.g. share-link previews).
- **LLM provider:** **Anthropic only** for MVP. Use Claude vision models (default: Sonnet for quality; Haiku as a configurable cheaper option). No provider abstraction yet.
- **Platform:** **PWA-first.** Next.js app with a manifest, installable to home screen, camera via the browser's `capture="environment"` upload affordance. Native wrapper deferred unless friction shows up.

## Feature PRDs

Each capability gets its own file. Status reflects how nailed-down it is.

- `01-data-model.md` — recipe schema, folders, tags, units. **Drafted.**
- `02-capture.md` — photo → AI extraction → confirm flow. **Drafted.**
- `03-interactive-view.md` — recipe view, unit toggle, serving scaler. **Drafted.**
- `04-llm-integration.md` — BYO Anthropic key storage, server-side proxy, model selection. **Drafted.**
- `05-auth-and-onboarding.md` — Supabase magic-link flow, first-run setup, key onboarding. **Drafted.**

## Remaining open questions

These cut across feature PRDs and will be resolved as each is drafted.

- Recipe schema details (multi-photo? step groupings? source attribution shape?).
- Cost preview before extraction (show estimated tokens before submitting?).
- AI failure recovery UX (retry with different model? edit-from-scratch?).
- Default Anthropic model (Sonnet vs Haiku) for first capture.

## Changelog

- 2026-04-30 — initial draft based on conversation kickoff. Captured problem, goals, non-goals, MVP capability set, success metrics, and open questions.
- 2026-04-30 — locked decisions: server-backed storage with accounts; photo-only MVP ingestion; folders + tags (no nesting); dimensional-only unit conversion; linear ingredient scaling for servings.
- 2026-04-30 — locked decisions (round 2): Supabase as backend platform; magic-link auth; server-side encrypted LLM key with proxied calls; Anthropic-only providers; PWA-first.
