# Recipe data model

**Status:** draft
**Last updated:** 2026-05-05
**Owner:** Kaz

## Summary

The shape of a recipe — and how recipes are organized — is the foundation everything else (capture, view, scaling, search) builds on. This PRD specifies the schema, the folder/tag taxonomy, and the unit representation rules.

## User story

> As a user, I want my saved recipes to look like recipes — title, ingredients, steps — and to be organized in folders I create with tags I can pile on freely. I want quantities stored in a structured way so the app can rescale and convert them automatically.

## Requirements

### Must have

- **Recipe entity** with the fields below; persisted in Postgres under the user's row-level-secured scope.
- **Exactly one home folder per recipe.** No nesting. Folders are user-created and renameable. A default folder ("Inbox") catches anything not assigned at capture time.
- **Tags are arbitrary, multi-valued strings.** Created on the fly when typed. No taxonomy enforcement.
- **Ingredients are structured** — each ingredient has a parsed quantity, unit, and item, plus an optional note and optional section group. The original raw text is preserved verbatim too (so we can fall back to it if parsing was wrong).
- **Steps are an ordered list of step objects.** Each step is `{ text: string, group?: string }`. The `group` is an optional section label ("For the sauce") inferred from the source.
- **Units stored canonically.** Quantities are stored as `{value, unit}` where `unit` is from a fixed enum (see Units below). Display unit is computed from the user's preference, not stored per-recipe.
- **Original capture photo is preserved** in Supabase Storage and linked from the recipe. Even after AI extraction, we keep the source image — a user might want to re-extract or check the original.

### Should have

- **Source attribution** — free-form text field ("Marcella Hazan, *Essentials of Classic Italian Cooking*, p.182" or "Mom"). Optional. AI tries to fill it from the photo (cookbook header, attribution line) but the user owns it.
- **Notes field** — free-form personal notes ("doubled the garlic, perfect"). Distinct from steps. Optional.
- **Default servings** — the recipe's "as-written" serving count, used as the baseline for the live scaler. Required for scaling to work; if AI can't extract it, prompt the user during the confirm step.

### Won't have (this round)

- **First-class section entity.** Sections are a soft `group` label on individual items, not their own table. Reorderable as a group only by reordering the items they contain.
- **Multiple photos** per recipe (the dish, plate-up, etc.). MVP keeps the original capture photo only.
- **Per-recipe unit override.** Units are a global user preference, not per-recipe.
- **Versioning / edit history.** Edits overwrite. Last-write-wins.
- **Nutrition fields** — explicitly out of scope (see overview).
- **Ratings / "made N times"** — defer until we see if it gets used.
- **Structured temperature extraction.** Step text stores prose verbatim; the unit toggle does render-time regex substitution (see `03-interactive-view.md`).

## Schema

### `recipes`

| field            | type                                | notes                                                                |
| ---------------- | ----------------------------------- | -------------------------------------------------------------------- |
| `id`             | `uuid`                              | primary key                                                          |
| `user_id`        | `uuid`                              | FK → `auth.users`. RLS enforces ownership.                           |
| `folder_id`      | `uuid`                              | FK → `folders`. NOT NULL. Default folder ("Inbox") seeded per user.  |
| `title`          | `text`                              | required                                                             |
| `source`         | `text`                              | nullable. Free-form attribution.                                     |
| `notes`          | `text`                              | nullable. Personal notes.                                            |
| `default_servings` | `int`                             | required. The recipe's as-written serving count.                     |
| `time_min`       | `int`                               | nullable. Total/active cook time in minutes. Shown as "20 MIN" on the detail page meta row. |
| `description`    | `text`                              | nullable. One-paragraph editorial blurb shown above the ingredient list on the detail page. |
| `ingredients`    | `jsonb`                             | array of `Ingredient` (see below). Order preserved.                  |
| `steps`          | `jsonb`                             | array of `Step` (see below). Order preserved.                        |
| `original_photo_path` | `text`                         | nullable. Path inside the Supabase Storage bucket.                   |
| `extracted_at`   | `timestamptz`                       | when AI extraction completed. Null for manual entries.               |
| `extraction_model` | `text`                            | which Claude model produced this extraction. Null for manual.        |
| `created_at`     | `timestamptz`                       |                                                                      |
| `updated_at`     | `timestamptz`                       |                                                                      |

### `folders`

| field      | type   | notes                                                              |
| ---------- | ------ | ------------------------------------------------------------------ |
| `id`       | `uuid` | primary key                                                        |
| `user_id`  | `uuid` | FK → `auth.users`. RLS.                                            |
| `name`     | `text` | unique per user (case-insensitive). "Inbox" reserved at signup.    |
| `created_at` | `timestamptz` |                                                              |

### `tags` and `recipe_tags`

Tags are normalized for fast filtering ("show all `quick` recipes") without scanning a JSON column.

```
tags(id, user_id, name UNIQUE per user)
recipe_tags(recipe_id, tag_id)  -- composite PK
```

Tags are auto-created when a user types a new one. No deletion UI in MVP — orphan tags (no recipes referencing them) just sit there.

### `Ingredient` and `Step` (jsonb shapes)

```ts
type Ingredient = {
  raw: string;            // original text from the recipe ("2 cups all-purpose flour, sifted")
  quantity?: {
    value: number;        // 2
    unit: Unit;           // "cup"
  };
  range?: {               // for "1-2 cloves garlic" cases
    low: number;
    high: number;
    unit: Unit;
  };
  item: string;           // "all-purpose flour"
  note?: string;          // "sifted"
  group?: string;         // section label, e.g. "For the dough"
};

type Step = {
  text: string;           // prose, verbatim from the source. Temperatures are NOT extracted as data —
                          // the view layer regex-substitutes °F ↔ °C at render time.
  group?: string;         // section label, e.g. "Make the sauce"
};
```

`quantity` and `range` are mutually exclusive. Either, or neither (e.g. "salt to taste"). `group` is preserved verbatim from the source — no normalization across recipes.

### `Unit` (enum)

Stored as a string. Conversion logic lives in code (see `02-units.md`).

- **Volume:** `tsp`, `tbsp`, `floz`, `cup`, `pint`, `quart`, `gallon`, `ml`, `l`
- **Weight:** `oz`, `lb`, `g`, `kg`
- **Count:** `whole`, `clove`, `pinch`, `dash`, `slice` (no conversion — informational)
- **Length:** `inch`, `cm` (rare, but appears in things like "1-inch cubes")
- **Temperature:** `f`, `c` (used in steps, not ingredients — see Open questions)

If AI extracts a unit not in this enum, we store it under a `custom_unit: string` field on `quantity` and skip conversion for that ingredient.

## Storage layout

- **Postgres:** the relational data above.
- **Supabase Storage bucket** `recipe-photos`, organized as `{user_id}/{recipe_id}/{uuid}.jpg`. RLS policy: a user can only read/write under their own `{user_id}/` prefix.
- **No image transformation pipeline in MVP.** Display the original; resize on the client if needed. Re-uploading a higher-quality photo overwrites the old one.

## Indexes

- `recipes (user_id, folder_id, updated_at desc)` — folder views, sorted recent-first.
- `recipes (user_id, title)` — for title search (also consider `pg_trgm` for fuzzy).
- `recipe_tags (tag_id)` — tag filter.

## Acceptance criteria

- [ ] A new user gets an "Inbox" folder created on signup.
- [ ] Creating a recipe with no folder assigned drops it in Inbox.
- [ ] Renaming a folder updates all affected recipes' folder reference (FK, so trivially).
- [ ] Adding a tag that doesn't exist yet creates it; removing the last reference doesn't auto-delete it (orphans are fine in MVP).
- [ ] Ingredient JSON round-trips: capture → save → reload → display preserves quantity, unit, item, note.
- [ ] An ingredient with a non-enum unit (e.g. "knob") still saves and displays the raw text — just not convertible.
- [ ] RLS prevents user A from reading user B's recipes, folders, tags, or photos.

## Open questions

- **Source attribution structure.** Free-form text only in MVP. If we ever want "all recipes from Marcella Hazan," structured fields (book, author, page) would help — defer until search needs it.
- **Folder color / icon.** Pure UX question. Postpone unless we want it for visual scanning.

## Changelog

- 2026-05-05 — added `time_min` (int) and `description` (text) to `recipes`. Both nullable. Carries forward design fields the prototype shows (cook-time chip, recipe blurb) that the initial schema lacked. Migration `20260505072311_add_recipe_time_and_description.sql`.
- 2026-04-30 — initial draft. Captured schema, folder/tag model, ingredient shape, unit enum, RLS storage rules, indexes, acceptance criteria, and open questions for the iteration round.
- 2026-04-30 — locked: optional `group` label on Ingredient and Step (no first-class group entity); temperatures stay as prose with render-time substitution (no structured extraction); single original photo per recipe (no finished-dish slot in MVP).
