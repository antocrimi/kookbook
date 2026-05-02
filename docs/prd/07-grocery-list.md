# Grocery list

**Status:** draft (post-MVP)
**Last updated:** 2026-05-02
**Owner:** Antonello

## Summary

Turn recipe ingredients into a consolidated grocery checklist. Select one or more recipes, and the app aggregates, deduplicates, and groups ingredients into a shoppable list. Post-MVP: sync with Apple Reminders on iOS for native checklist integration.

**This feature is scoped as a post-MVP follow-up.** The PRD is drafted now to capture intent and inform architectural decisions (e.g., Capacitor native wrapper) that may affect earlier work.

## User story

> As a user planning meals for the week, I want to select 3 recipes, tap "Add to grocery list," and get a single merged list — "3 cups flour" from two recipes becomes one line. I can check items off while shopping, and ideally see the list in my phone's native Reminders app.

## Requirements (post-MVP)

### Must have

- **In-app grocery list.** A persistent checklist view at `/grocery`. Users add recipes (or individual ingredients) to it. Items persist across sessions (stored server-side).
- **Ingredient aggregation.** When multiple recipes contribute the same ingredient, quantities merge: "2 cups flour" + "1 cup flour" → "3 cups flour." Merging is unit-aware (won't merge "1 cup" + "200g" unless the user's unit system can normalize them to the same dimension). Non-mergeable items appear separately with recipe attribution.
- **Aisle grouping.** Basic category grouping: produce, dairy, meat, pantry, frozen, other. AI-assisted categorization at add-time (lightweight Claude call, or a static lookup table for common items). Grouping helps the user navigate the store in one pass.
- **Check-off.** Tap to strike through. Checked items move to a "Done" section at the bottom. "Clear checked" action removes them.
- **Per-recipe attribution.** Each item shows which recipe(s) it came from. Tapping the attribution opens the recipe.
- **Manual add.** Free-text "Add item" input for things not from recipes ("paper towels," "birthday candles").

### Should have — Apple Reminders sync

- **Native wrapper (Capacitor).** To access Apple Reminders, the app needs a native shell. This is a **platform decision** that affects more than just grocery — it also enables push notifications, better camera access, and App Store distribution.
- **Reminders integration.** On iOS with the native wrapper installed, "Send to Reminders" exports the grocery list as items in a dedicated Reminders list ("Cuckoobook Grocery" or user-named). Uses the EventKit framework via a Capacitor plugin.
- **One-way sync (MVP of the feature).** App → Reminders. Checking off in Reminders does NOT sync back to the app. Two-way sync is a further follow-up.
- **Android equivalent.** Google Tasks or Google Keep integration via their APIs. Same one-way pattern.

### Won't have (first version of this feature)

- **Two-way sync** with Reminders / Google Tasks.
- **Shared grocery lists** (multi-user).
- **Price estimates** or store-specific pricing.
- **Barcode scanning** for pantry inventory.
- **Meal planning calendar** — the grocery list is recipe-driven, not date-driven.

## Schema additions (when implemented)

```sql
grocery_lists (id, user_id, name, created_at, updated_at)
grocery_items (id, list_id, text, quantity jsonb, category, checked, recipe_id nullable, sort_order)
```

## Open questions

- **Ingredient identity.** How to determine "flour" from recipe A and "all-purpose flour" from recipe B are the same item? Exact string match is brittle. AI normalization (Claude call at add-time) is more robust but costs tokens. Hybrid: normalize common items via a static map, fall back to AI for unknowns.
- **Capacitor timeline.** When to add the native wrapper? It's a prerequisite for Reminders sync but also enables other features (push, camera, App Store). Consider adding it as a foundational infrastructure ticket before this feature.
- **List lifecycle.** One active list at a time, or named lists ("Week of May 5," "Dinner party")? Probably one active + archive for simplicity.

## Changelog

- 2026-05-02 — initial draft. Scoped as post-MVP. Captured aggregation, aisle grouping, check-off, Apple Reminders sync via Capacitor, and open questions.
