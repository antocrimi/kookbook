# Shopping list

**Status:** draft
**Last updated:** 2026-05-01
**Owner:** Kaz

## Summary

A shopping list built from one or more saved recipes. The user picks recipes (and per-recipe servings), and the app produces a consolidated, deduplicated, scaled list of ingredients in the user's preferred unit system. The list is checkable while shopping, sharable as plain text, and persists across sessions.

This is not meal planning. There's no calendar, no "this week's plan," no recipe scheduling. It's a one-step bridge from "I want to cook these recipes" to "here's what to buy."

A future round (explicitly out of scope for MVP) connects the list to a grocery delivery / pickup service like Instacart, Amazon Fresh, or Whole Foods. We design the list shape so that integration is additive, not a rework.

## User story

> As a user planning to cook two or three recipes this weekend, I want to pick those recipes, set how many people I'm cooking for on each, and get a single shopping list — combined where it can be ("400g flour" not "200g flour, 200g flour"), in my preferred units — that I can check off in the store.

## Flow

```
[Recipe view] → "Add to shopping list" → [Pick servings → list updates]
[Recipe list / folder view] → multi-select → "Add to shopping list"
[Shopping list view]
  ├── grouped by aisle/category (best-effort)
  ├── tap item → strike-through (persisted, not session-only)
  ├── adjust per-recipe servings inline → list re-aggregates
  ├── remove a recipe from the list → list re-aggregates
  ├── share / copy as text
  └── clear checked items / clear all
```

## Requirements

### Must have

- **List entity, persisted per-user.** A user has at most one active shopping list at a time in MVP — adding from a recipe appends to it. The list survives sessions and devices (server-backed via Supabase, RLS-scoped).
- **Add a recipe to the list.** From the recipe view (button) and from multi-select on a folder/recipe list view (bulk action). Adding the same recipe twice with different serving counts is allowed (treated as separate "lines" — see aggregation rules).
- **Per-recipe servings on the list.** Each recipe contribution stores the recipe id + the chosen serving count. Defaults to the recipe's `default_servings`. Editable inline on the list.
- **Aggregation.** Ingredients across recipes combine into a single list of items:
  - **Same item, same dimension (volume / weight / count):** sum quantities, converted to the larger / display unit. ("200g flour" + "1 cup flour" both become weight-or-volume in the user's preferred system; mixed-dimension items don't combine — see Open questions.)
  - **Same item, different prep notes:** keep separate lines ("onion, diced" vs "onion, sliced") because the prep matters at home, not in the cart. We can collapse to one purchase line in the share view (see below).
  - **Items the model couldn't normalize** (custom_unit, range only, "to taste"): keep verbatim, listed under an "Other" group.
- **Unit system honored.** The list renders in the user's preferred metric / imperial system, with the same "nice number" rounding rules as the recipe view (`03-interactive-view.md`).
- **Check-off state, persisted.** Tapping an item toggles it checked. State persists across sessions and devices. Checked items render struck-through and sink to the bottom (or under a "Got it" group).
- **Remove a recipe from the list.** Removes that recipe's contributions; list re-aggregates. Other recipes' contributions are untouched.
- **Clear all / clear checked.** Two actions: empty the list entirely, or remove only checked items.
- **Share / copy as plain text.** A "Copy" action puts a clean text version on the clipboard:
  ```
  Shopping list — Pasta al Pomodoro (4), Caesar Salad (2)
    [ ] 800 g whole peeled tomatoes
    [ ] 60 g unsalted butter
    [ ] 1 medium onion
    [ ] 2 romaine hearts
    …
  ```
  Plus a "Share" action that uses the Web Share API on supported browsers.
- **Accessibility parity.** Same legibility / contrast / keyboard / screen-reader rules as the recipe view (`03-interactive-view.md`). Each item is a `role="checkbox"` with `aria-checked`. Tap targets ≥ 44 × 44 CSS px.

### Should have

- **Aisle / category grouping.** Group items by a coarse category (Produce / Dairy / Pantry / Meat / Other) for in-store scannability. Categorization is heuristic — a small static lookup table on common ingredient names, with fallback to "Other." Not LLM-powered in MVP. The list works fine if everything lands in "Other" — grouping is a polish.
- **Manual edit on the list.** Add an arbitrary item ("paper towels"), edit a quantity, or remove a single line. Manual items live alongside recipe-derived items and don't get aggregated against them.
- **Source recipe per item.** A small affordance per line ("from Pasta al Pomodoro") so the user knows why that item is on the list. Tapping it deep-links to the recipe view.
- **Print view.** Same rationale as the recipe-view print: a clean single-column printable list with checkboxes.

### Won't have (this round)

- **Multiple named lists** ("This week," "Mom's visit"). One active list per user in MVP. If demand shows up, add a list-picker.
- **Meal-planning / calendar integration.** No "cook this on Tuesday." Out of scope; see overview non-goals.
- **LLM-powered ingredient categorization.** A static lookup is enough. Burning tokens to assign every ingredient to an aisle is overkill for MVP.
- **Volume↔weight conversion during aggregation.** Same constraint as the recipe view — we don't infer densities. "1 cup flour" and "200g flour" stay as separate lines in the list. Open question: do we surface a soft "these might be the same, combine?" hint? Defer.
- **Pantry / "I already have this" awareness.** No model of what's in the user's kitchen. Every ingredient lands on the list regardless. Pantry tracking is a separate product.
- **Direct grocery integration.** No Instacart / Amazon Fresh / Whole Foods / store-loyalty API in MVP. The plain-text + Web Share path is the export. See "Future direction" below.
- **Receipt OCR / "did you actually buy it?"** Out of scope.
- **Estimated cost / price lookup.** Out of scope. No grocery price API in MVP.

## Future direction — grocery service integration (post-MVP)

We're not building this now, but we are designing the list shape so it's straightforward to plug in later. Concretely:

- The list's per-line representation already includes a structured `{quantity, unit, item, note}` per ingredient (inherited from the recipe's `Ingredient` schema). That's the bulk of what an Instacart-style "deeplink to cart" or "create an order" call needs.
- Integrations are envisioned as **export sinks**, not as the list's storage backend. The user's source-of-truth list lives in our database; an integration produces a basket on the third party.
- Likely shapes when the time comes:
  - **Deeplink export** — generate an Instacart "Recipes API" or equivalent URL that pre-fills a cart from the list. No account linkage, no tokens stored, just a one-shot URL. This is the lowest-lift integration and probably the right MVP-of-the-feature.
  - **OAuth-linked basket** — user connects an Instacart / Amazon account, we push items into a real cart, surface confirmation/state. Bigger lift; deferred until deeplink usage proves demand.
- Open: which provider(s) to support, regional coverage, sponsored-product ethics. Resolve when we pick this up — captured here only so the data model doesn't grow shape-incompatible in the meantime.

This section is intentionally non-binding. It exists to prevent decisions in MVP that would foreclose it later (e.g. throwing away `unit` and storing only display strings).

## Schema

### `shopping_lists`

| field      | type          | notes                                                       |
| ---------- | ------------- | ----------------------------------------------------------- |
| `id`       | `uuid`        | primary key                                                 |
| `user_id`  | `uuid`        | FK → `auth.users`. RLS. Unique per user (one active list).  |
| `created_at` | `timestamptz` |                                                           |
| `updated_at` | `timestamptz` |                                                           |

### `shopping_list_recipes`

A recipe contribution to the list. Multiple rows per list possible.

| field             | type   | notes                                                       |
| ----------------- | ------ | ----------------------------------------------------------- |
| `id`              | `uuid` | primary key                                                 |
| `shopping_list_id`| `uuid` | FK → `shopping_lists`.                                      |
| `recipe_id`       | `uuid` | FK → `recipes`.                                             |
| `servings`        | `int`  | the chosen serving count for this contribution              |
| `created_at`      | `timestamptz` |                                                      |

### `shopping_list_items`

Manual items added directly to the list (not derived from a recipe), plus the per-line **checked** state for any line (recipe-derived or manual).

| field                | type   | notes                                                                                  |
| -------------------- | ------ | -------------------------------------------------------------------------------------- |
| `id`                 | `uuid` | primary key                                                                            |
| `shopping_list_id`   | `uuid` | FK → `shopping_lists`.                                                                 |
| `kind`               | `text` | `'manual' | 'aggregated'`                                                              |
| `aggregation_key`    | `text` | for `'aggregated'` rows: a stable hash of `(item, unit-dimension, prep-note)` so the row survives list edits. NULL for manual rows. |
| `display_text`       | `text` | for `'manual'` rows: the user-typed text. NULL for aggregated rows (rendered from the live aggregation). |
| `checked`            | `bool` | NOT NULL. Default false.                                                               |
| `category`           | `text` | nullable. Coarse aisle category if assigned.                                           |
| `created_at`         | `timestamptz` |                                                                                 |
| `updated_at`         | `timestamptz` |                                                                                 |

The aggregated list is **computed at read time** from `shopping_list_recipes` joined to `recipes.ingredients`, with `shopping_list_items.aggregation_key` providing the persistent check-off state. Manual items are appended as plain rows. This keeps the list reactive to recipe edits without write amplification.

## Acceptance criteria

- [ ] Adding a recipe to the shopping list from the recipe view appends it; the recipe view's serving count carries over as the contribution's serving count.
- [ ] Multi-select bulk-add from a folder view adds each selected recipe with its `default_servings`.
- [ ] Adjusting a recipe's servings on the list re-aggregates ingredient quantities live.
- [ ] Removing a recipe from the list removes its contributions; other recipes' lines persist.
- [ ] Two recipes with the same item in the same dimension produce one combined line; mixed dimensions stay separate.
- [ ] Quantities render in the user's preferred unit system with "nice number" rounding (per `03-interactive-view.md`).
- [ ] Check-off state persists across reloads and across devices for the same user.
- [ ] "Copy as text" produces a plaintext list including a header naming the recipes and their serving counts.
- [ ] Web Share is available on supported browsers; absence is handled silently (Copy still works).
- [ ] RLS prevents user A from reading or writing user B's shopping list, contributions, or items.
- [ ] Manual items can be added, edited, removed, and checked alongside aggregated items.
- [ ] The list view meets the same accessibility acceptance criteria as the recipe view (keyboard, screen-reader, contrast, zoom, reduced-motion).

## Open questions

- **Aggregation key stability.** When a recipe is edited (an ingredient's name changes from "yellow onion" to "onion"), the `aggregation_key` for that ingredient shifts and the user's check-off state on that line is lost. Acceptable cost? Or should we soft-match by item name and warn? Probably acceptable for MVP — recipe edits are rare on the cooking horizon.
- **Volume / weight "probably the same" hint.** When the same item appears in both volume and weight forms ("1 cup flour" and "200g flour"), do we show a non-blocking hint suggesting they might be combinable? Risk of being wrong on dense items. Defer.
- **Category lookup source.** Hardcoded JSON of ~200 common ingredients → categories? Pull from an open dataset? In-house authored? Probably hardcoded JSON committed to the repo, easy to extend.
- **Multiple lists.** Confident MVP can ship with a single active list. Worth revisiting if users start asking, but not before.
- **Sharing the list to another person (not just clipboard).** Probably out of scope until the post-MVP "share-link" capability lands generally (see overview).

## Changelog

- 2026-05-01 — initial draft. Defined list scope, aggregation rules, schema, accessibility parity, MVP feature set, and post-MVP grocery-integration design intent.
