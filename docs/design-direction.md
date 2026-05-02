# Design direction

**Last updated:** 2026-05-02

This document captures the visual and interaction direction for the app. It governs all UI work — new features, component additions to `@cuckoobook/ui`, and page layouts.

## Philosophy

**Cookbook as object of beauty.** The app should feel like a well-designed cookbook — editorial, elevated, refined — not a utility. Recipes deserve the same visual respect they get in a printed book: generous whitespace, considered typography, photography as a first-class element. But it must also be **ruthlessly usable**: legible from across a kitchen counter, operable with one wet hand, clear enough that nothing needs explaining.

## Reference apps

- **NYT Cooking** — editorial quality, photography-forward, high-contrast cooking mode, structured ingredient lists, bottom-page CTA for cook mode
- **Mela** — warm card-based recipe list, clean mobile-native feel, thoughtful empty states
- **Pestle** — structured ingredients with checklist, step-by-step navigation
- **Airbnb** — fluid page transitions, micro-interactions on cards and modals, spring-based animations, surprise-and-delight moments without slowing down the user

## Typography

**Primary typeface:** "The Seasons" (Adobe Fonts)

```html
<link rel="stylesheet" href="https://use.typekit.net/usz6qzd.css">
```

- **Font family:** `"the-seasons", serif`
- **Available weights:** 400 (regular), 700 (bold), both in normal and italic
- **Usage:**
  - Recipe titles, section headings, cooking-mode step text → `the-seasons`, 700 or 400 italic
  - Body text, ingredient lists, UI labels → system sans-serif stack or a complementary sans (consider Inter, Instrument Sans, or the system default for maximum readability)
  - Monospace for quantities/numbers if desired (tabular figures)

The serif creates the editorial feel. The sans-serif keeps ingredients and UI controls legible at small sizes. Never use the serif below 16px.

## Color palette

### Core

| Token | Hex | Usage |
| --- | --- | --- |
| `forest` | `#1a3a2a` | Cooking mode background, preparation sections, primary dark |
| `cream` | `#faf5ef` | Page backgrounds, cooking mode text, cards |
| `ink` | `#1c1c1c` | Primary body text |
| `stone` | `#6b6b6b` | Secondary text, captions |
| `line` | `#e8e3dc` | Borders, dividers |

### Accents (explore)

| Token | Hex | Usage |
| --- | --- | --- |
| `coral` | `#e07a5f` | CTAs, active states, highlights, timer badges |
| `mustard` | `#d4a843` | Tags, secondary actions, star/favorite, warmth |
| `sage` | `#87a878` | Success states, checked items, fresh/positive |

The coral and mustard add warmth and editorial punch against the green/cream foundation. Use sparingly — they're accents, not surfaces. The palette should feel like a food magazine: warm, appetizing, grounded.

### Cooking mode (high contrast)

- Background: `forest` (#1a3a2a)
- Text: `cream` (#faf5ef)
- Timer badges: `coral` (#e07a5f)
- Step dots: `cream` at 40% opacity, active dot at 100%
- AI chat overlay: slightly lighter green or semi-transparent `forest`

### Light mode (default)

- Background: `cream` (#faf5ef)
- Cards: white (`#ffffff`)
- Text: `ink` (#1c1c1c)
- Accents: `coral` for primary CTAs, `forest` for secondary buttons and navigation

## Micro-interactions and animation

**Principles:**
1. **Physics-based, not linear.** Spring animations (ease-out with overshoot) for modals, sheets, and card transitions. Never use `linear` easing.
2. **Purposeful, not decorative.** Every animation communicates state: an ingredient checking off, a step transitioning, a timer starting. No animation for animation's sake.
3. **Fast defaults, slow for drama.** UI transitions: 200–300ms. Cooking-mode step transitions: 400–500ms with a slight slide + fade (more theatrical, matches the immersive feel). Page transitions: 300ms shared-element where possible.
4. **Surprise in the details.** A gentle bounce when a timer completes. Ingredients that subtly stagger in on load. The serving scaler that makes quantities "roll" like an odometer. These moments make the app feel crafted.

**Key animations:**
- **Card press:** scale down to 0.97 on press, spring back on release (Airbnb-style)
- **Page transitions:** shared-element hero image from list → recipe view (Next.js View Transitions API or Framer Motion `layoutId`)
- **Step swipe (cooking mode):** horizontal slide with slight parallax on the group label
- **Ingredient check-off:** strike-through line draws left-to-right (200ms), row fades to 60% opacity
- **Timer badge pulse:** subtle scale pulse (1.0 → 1.05 → 1.0) every 10 seconds while running
- **Serving scaler:** quantity numbers animate like a slot machine / odometer on change
- **Modal/sheet:** spring-based slide-up with backdrop blur fade

**Libraries:** Framer Motion for React (spring physics, layout animations, `AnimatePresence`). CSS `@starting-style` and `transition-behavior: allow-discrete` for simpler transitions where JS isn't needed.

## Layout principles

- **Photography first.** Recipe hero images are full-bleed on mobile, generous on desktop. Never crop to a tiny thumbnail on the main view.
- **Generous whitespace.** Padding is never less than 16px; section gaps are 32–48px. The design breathes.
- **Single-column mobile.** No side-by-side on phone. Desktop can use a 2-column layout for recipe view (ingredients pinned left, steps scrolling right).
- **Bottom-anchored CTAs.** Primary actions (Cook, Save, Capture) live at the bottom of the viewport on mobile — thumb-reachable. Not buried in a top nav.
- **Collapsible secondary content.** Source, notes, original photo default to collapsed. The cooking-relevant content (ingredients, steps) is always above the fold.

## Component implications for `@cuckoobook/ui`

The design direction means updating the theme layer:
- Add `the-seasons` as the serif font family in `data-theme`
- Add the new color tokens to `_themes.scss` / `_variables.scss`
- Consider a `theme-cooking` variant for cooking-mode-specific overrides (dark green bg, cream text)
- New components needed: `NumberStepper` (INF-5), `PhotoUpload` (INF-4), `TimerBadge`, `StepCarousel`

## Changelog

- 2026-05-02 — initial draft. Captured typography (The Seasons), color palette (forest/cream/coral/mustard), animation principles (spring-based, Airbnb-inspired), layout rules, and cooking mode visual language.
