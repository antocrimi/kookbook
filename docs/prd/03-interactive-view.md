# Interactive recipe view

**Status:** draft
**Last updated:** 2026-04-30
**Owner:** Kaz

## Summary

The screen where a saved recipe is *used*. The product promise is "your recipe adapts to you" — units in your system, scaled to tonight's serving count, no mental math. This PRD defines that screen's behavior and the conversion / scaling rules behind it.

## User story

> As a user about to cook, I want to open a saved recipe, set the number of people I'm cooking for, and see ingredient amounts in my preferred units — without re-doing math or searching for a converter.

## Flow

```
[Folder/list] → [Recipe view]
                  ├── set serving count → all ingredients re-render
                  ├── flip unit system → all ingredients + step temperatures re-render
                  ├── tap ingredient → strike-through (cooking checklist)
                  ├── tap step → step is "active" (subtle highlight)
                  └── pencil icon → enter edit mode (same form as capture confirm)
```

## Requirements

### Must have

- **Render the recipe in full**: title, source, default servings, ingredient list, ordered step list, original photo (collapsible), notes.
- **Group rendering.** When ingredients/steps have a `group` label, render them under that group heading. Ungrouped items render under a default block.
- **Live serving scaler.** A control on the recipe header shows the current serving count, defaulting to the recipe's `default_servings`. Changing it instantly re-renders every ingredient quantity. Persists per-recipe in client state for the session; not written to the recipe row.
- **Live unit toggle.** A user-level setting (in profile/settings) chooses **metric** or **imperial**. The recipe view honors it on render. No per-recipe override in MVP.
  - **Volume:** if user is metric, all volume units render in `ml` / `l` (with a sensible cutover, e.g. `≥ 1000 ml` → `l`). If imperial, render in `tsp / tbsp / cup / floz`.
  - **Weight:** metric → `g` / `kg`; imperial → `oz` / `lb`.
  - **Temperature:** metric → `°C`; imperial → `°F`. Step text is regex-substituted at render (see below).
  - **No volume↔weight conversion** — locked in `00-overview.md`.
- **"Nice number" rendering.** Scaled quantities round to readable values:
  - Whole numbers when within ±2% of an integer.
  - Common fractions (`½`, `⅓`, `¼`, `⅛`) when within ±5% of a half/third/quarter/eighth in imperial mode.
  - One decimal place otherwise.
  - Unit-aware minimums (don't display "0.05 tsp" — clamp to "pinch" guidance or fall back to grams).
- **Temperature substitution in step text.** A render-time pass replaces `\d+\s*°?\s*F` ↔ `\d+\s*°?\s*C` according to the active unit system. Substitutions are visually marked (subtle underline or different color) so the user knows the original wasn't this exact value.
- **Ingredient checklist.** Tap an ingredient to toggle it strike-through. State is per-recipe-per-session, client only — does not persist.
- **Edit mode.** Pencil icon enters edit mode, which reuses the capture confirm form. Save persists; cancel reverts.

### Should have

- **Step focus.** Tap a step to mark it "active" — slightly darker background, or a thin left border. Helps not-losing-your-place while cooking. Per-session, client only.
- **Wake lock when actively viewing a recipe.** Use the Screen Wake Lock API on supported browsers so the phone screen doesn't dim mid-cook. Best-effort — it's a "should have" because the API isn't universal.
- **Print view.** Browser print yields a clean, single-column recipe with current serving count and units bake-in. No interactive controls in the printout.
- **Source / notes / photo collapsed by default** on the recipe view to keep the cooking-relevant content above the fold.

### Won't have (this round)

- **Dedicated "cook mode"** — full-screen step-by-step with timers, voice, hands-free. Wake lock + tap-to-focus is the MVP version. Cook mode is a future capability.
- **Ingredient density-based volume↔weight conversion.** Locked.
- **Per-recipe unit override.** Locked — global preference only.
- **Scaling cooking times or temperatures.** Times and temperatures pass through unchanged. The serving scaler ONLY scales ingredient quantities. (See `00-overview.md` rationale.)
- **Cross-device sync of checklist / scaler state.** Session-only, client-only. If you reload, checklist resets and scaler returns to default servings.

## Conversion and rounding rules

### Within-system conversion (display only — storage stays canonical)

When the recipe was authored in imperial and the user is on metric (or vice versa), pick a sensible target:

```
Volume tiers (metric):
  < 5 ml      → ml (rounded to nearest 0.5)
  < 1000 ml   → ml (rounded to nearest 5)
  ≥ 1000 ml   → l  (one decimal)

Volume tiers (imperial):
  < 1 tsp     → tsp (eighths)
  < 1 tbsp    → tsp (quarters)
  < 1 cup     → tbsp or cup-fractions
  ≥ 1 cup     → cup (eighths/quarters)

Weight tiers (metric):
  < 1000 g    → g  (rounded to nearest 5)
  ≥ 1000 g    → kg (one decimal)

Weight tiers (imperial):
  < 1 lb      → oz (quarters)
  ≥ 1 lb      → lb (eighths)
```

Tiers and rounding are defined as constants in code, not configurable. Get one set of opinions right; iterate.

### Range scaling

If the source recipe says "1–2 cloves garlic", scaling 4 → 6 servings yields "1.5–3 cloves." Both ends scale; the rounding rules apply to each end independently. We never collapse a range to a single value.

### Count-unit scaling

For unitless counts ("3 eggs"), scaling can produce non-integers ("4.5 eggs"). Round to the nearest whole number with a small visible note ("eggs scaled approximately"). Don't show "4.5 eggs."

### Temperature substitution

Render-time only. No structured extraction. Regex pattern matches conservative shapes:

- `(\d{2,3})\s*°?\s*F\b` → convert to °C, format as integer
- `(\d{2,3})\s*°?\s*C\b` → convert to °F, format as integer

Edge cases skipped (kept verbatim): ranges ("350°F to 400°F"), gas marks ("gas mark 4"), anything below 50 (likely not an oven temp). The substituted token is wrapped in a `<span data-converted="true">` so we can style it differently.

## UX shape (informational)

```
┌──────────────────────────────────────────────┐
│ ← Back     Pasta al Pomodoro       ✏  ⋯     │  Title row + edit/menu
│ from Marcella Hazan                          │  Source line
│                                              │
│ Servings: [-] 4 [+]      Units: ⓘ Metric    │  Live controls
│                                              │
│ Ingredients                                  │
│   For the sauce                              │  Group label
│   • 800 g whole peeled tomatoes              │
│   • 60 g unsalted butter                     │
│   • 1 medium onion, peeled and halved        │
│                                              │
│ Steps                                        │
│   1. Combine tomatoes, butter, and onion ... │  Tap to focus
│   2. Bring to a simmer, then ...             │
│                                              │
│ ▸ Original photo                             │  Collapsed
│ ▸ Notes                                      │
└──────────────────────────────────────────────┘
```

Wireframes are illustrative only. The `@cuckoobook/ui` library has the components needed (`TextField`, `Button`, `Switch`, `Tabs`, `Slider` for the serving control, etc.).

## Acceptance criteria

- [ ] Opening a recipe defaults to its `default_servings`. Changing the scaler updates every ingredient quantity in real time, and ranges scale on both ends.
- [ ] Switching the user's unit preference between metric and imperial (in settings) reflects on the recipe view immediately on next render. No per-recipe override exists.
- [ ] Within-system rounding produces "nice" numbers per the tiers above, never raw floats like `47.234 g`.
- [ ] Temperature substitution converts isolated `°F` ↔ `°C` in step text and visually marks the substituted span. Ranges and gas marks pass through.
- [ ] Tapping an ingredient toggles strike-through. Reloading the page resets it.
- [ ] Tapping the pencil icon enters edit mode using the same form as capture confirm; saving persists changes; canceling reverts.
- [ ] Print output is clean, single-column, and reflects the current serving count and unit system.
- [ ] On mobile, the wake lock is requested when the recipe view is open and released on navigation away (best-effort — silent failure on unsupported browsers).

## Open questions

- **Fraction rendering style.** Use Unicode glyphs (`½`, `⅓`, `¼`)? Or composed forms (`1 1/2`)? Glyphs are prettier and well-supported in modern fonts; composed is more resilient to copy-paste. Default: glyphs, fall back to composed on copy.
- **Where is the unit toggle visible?** Settings only (global, hidden), or also a small chip on the recipe header that opens settings? The chip is more discoverable but adds to header clutter.
- **Servings stepper bounds.** Min 1, max ? Allow non-integer servings (1.5)? Probably yes — half-recipes are common.
- **Wake lock UX feedback.** Silent (just works on supported browsers), or visible indicator? Silent risks confusion when it doesn't work; indicator risks noise.

## Changelog

- 2026-04-30 — initial draft. Captured render shape, conversion tiers, scaling rules (incl. ranges and counts), temperature substitution, acceptance criteria, and open questions.
