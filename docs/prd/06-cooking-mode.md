# Cooking mode

**Status:** draft
**Last updated:** 2026-05-02
**Owner:** Antonello

## Summary

A full-screen, high-contrast, immersive view for actively cooking from a recipe. Designed to be legible from arm's length (phone propped on a counter), navigable by voice or swipe, and augmented by an AI assistant that can read steps aloud, clarify techniques, and answer questions — all powered by the user's BYO Anthropic key.

## User story

> As a user cooking in the kitchen, I want to see the current step in large, readable type on a high-contrast screen, swipe or say "next" to advance, tap a step to hear it read aloud, and ask the AI things like "what does 'fold in' mean?" — without touching my phone with wet hands more than necessary.

## Flow

```
[Recipe view] → [Tap "Cook" CTA at bottom] →
  [Cooking mode — step 1, full screen, high contrast]
    ├── swipe right or say "next step" → step 2
    ├── swipe left or say "previous step" → step 1
    ├── tap step text → TTS reads the step aloud
    ├── tap "Ask AI" CTA → AI chat overlay opens
    │     ├── speak or type a question
    │     ├── AI responds with context from the full recipe
    │     └── close overlay → back to current step
    ├── timer badge detected → tap to start countdown
    └── tap "×" or say "exit" → back to recipe view
```

## Requirements

### Must have

- **Full-screen immersive layout.** No browser chrome distractions. Step text is the hero — large, high-contrast, legible from 1–2 meters. The dark forest-green background from the design system with cream/white text.
- **Step-by-step navigation.** One step visible at a time. Swipe left/right to move between steps. Step counter ("3 of 8") visible but unobtrusive. Group labels ("Make the sauce") render as section headers between steps.
- **Voice navigation.** Browser Web Speech API (`SpeechRecognition`) for hands-free control. Recognized commands: "next step," "previous step," "repeat," "exit." Always-listening while cooking mode is active (with visible mic indicator). Graceful degradation: if Web Speech API is unsupported, voice nav is hidden and swipe/tap remain.
- **Tap-to-read (TTS).** Tapping the step text reads it aloud via browser `SpeechSynthesis` API. A small speaker icon on the step text affords this. Reading stops if the user navigates to another step.
- **AI chat mode.** A floating "Ask AI" button opens a slide-up overlay. The user speaks (Web Speech API) or types a question. The question is sent to Claude (via the existing `/api/extract` proxy pattern, using the user's BYO Anthropic key) with the full recipe as context. The AI response renders as text on screen. The AI does NOT speak the response by default — text only (keeps it simple for MVP).
- **Recipe context in AI calls.** The AI chat system prompt includes the full recipe (title, ingredients, steps, current step index) so Claude can give contextual answers ("how much butter?" → checks ingredients; "is the oven hot enough?" → checks the current step).
- **Inline timers.** Auto-detect time expressions in step text via regex (e.g., "simmer for 20 minutes," "bake 45 min," "rest 10 minutes"). Render as tappable badges. Tapping starts a countdown timer displayed as an overlay/toast. Audio alert when done. Multiple timers can run simultaneously (e.g., "boil pasta 12 min" while "sauce reduces 20 min").
- **Wake lock.** Request `navigator.wakeLock` on entry, release on exit. Screen stays on throughout. Best-effort — silent failure on unsupported browsers.
- **Ingredient reference.** A collapsible ingredients panel (swipe up from bottom or tap an "Ingredients" chip) shows the full ingredient list at the current serving scale and unit preference. Tap to dismiss.
- **Exit.** "×" button (top corner) or voice command "exit" returns to the recipe view.

### Should have

- **Brightness boost suggestion.** On entry, suggest "Turn up brightness for cooking?" — the app can't control OS brightness, but the prompt helps.
- **Step progress dots.** Minimal dot indicators showing total steps and current position (like a carousel).
- **AI conversation history.** Within a cooking session, the AI remembers prior questions (multi-turn). Cleared on exit.
- **Haptic feedback.** On step transitions, timer start/end (where supported via `navigator.vibrate`).
- **Landscape support.** Cooking mode works in both orientations — landscape is useful when phone is propped sideways.

### Won't have (this round)

- **AI voice output (TTS for AI responses).** MVP keeps AI answers as text. Voice output is a fast follow — adds complexity around interruption, volume, and audio overlap with timers.
- **Video or image per step.** Steps are text-only in MVP. Step images are a post-MVP data model extension.
- **Collaborative cooking.** No "cook together" or shared session.
- **Custom voice commands.** Only the fixed command set (next/previous/repeat/exit). No "set timer for 5 minutes" voice command in MVP — tap the timer badge instead.
- **Offline mode.** AI chat requires network. Step display works offline if the recipe is already loaded, but no explicit offline-first caching in MVP.

## AI chat call shape

System prompt (cached):

```
You are a helpful cooking assistant. The user is actively cooking the recipe below and may ask about techniques, substitutions, timing, or clarifications.

Answer concisely — they're in the kitchen with messy hands. If the answer involves a quantity, use their preferred unit system ({unitPreference}).

They are currently on step {currentStepIndex + 1} of {totalSteps}.

Recipe:
{title}
Servings: {currentServings} (scaled from {defaultServings})

Ingredients:
{formattedIngredients}

Steps:
{formattedSteps}
```

User message: the spoken/typed question.

Model: user's `default_model` setting (Sonnet 4.6 default). A cooking-mode chat call is typically short — small input (recipe context ~500–2000 tokens), short output (~100–300 tokens). Cost per question: ~$0.01–0.03.

Route: `/api/cooking-chat` (new route, same proxy pattern as `/api/extract`).

## Timer detection

Regex patterns for step text:

```
/(\d+)\s*(?:to\s*(\d+))?\s*(?:-\s*(\d+))?\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/gi
```

Matched times render as `<button>` badges inline in the step text. Tapping starts a countdown. Timer state is client-only, not persisted. Multiple concurrent timers shown as a floating timer strip at the top of cooking mode.

## UX shape

```
┌──────────────────────────────────────────────┐
│ ×                              3 of 8    🎤  │  Header: close, counter, mic status
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │          Make the sauce                  │ │  Group label (if applicable)
│ │                                          │ │
│ │  Combine the tomatoes, butter,           │ │
│ │  and onion in a saucepan.                │ │  Step text — large, editorial serif
│ │  Simmer for  ⏱ 45 min  over             │ │  Timer badge inline
│ │  medium-low heat until the               │ │
│ │  butter has melted and the               │ │
│ │  onion is translucent.                   │ │
│ │                                     🔊  │ │  Tap-to-read affordance
│ └──────────────────────────────────────────┘ │
│                                              │
│           · · · ● · · · ·                    │  Step dots
│                                              │
│  ┌─────────────┐        ┌─────────────────┐ │
│  │ Ingredients  │        │    Ask AI 💬    │ │  Bottom actions
│  └─────────────┘        └─────────────────┘ │
│                                              │
│  ⏱ 45:00 Sauce  ⏱ 12:00 Pasta              │  Running timers strip
└──────────────────────────────────────────────┘

Background: dark forest green (#1a3a2a or from design tokens)
Text: cream/warm white (#faf5ef or from design tokens)
Typography: "The Seasons" serif for step text, large size (24–32px)
```

## Acceptance criteria

- [ ] "Cook" CTA on recipe view enters cooking mode full-screen with the first step displayed.
- [ ] Swiping right advances to the next step; swiping left goes back. Step counter updates.
- [ ] Voice commands "next step" and "previous step" navigate (verified on Chrome Android and Safari iOS with Web Speech API).
- [ ] Tapping step text triggers browser TTS reading of the step. Navigating away stops playback.
- [ ] "Ask AI" opens a chat overlay. A spoken or typed question gets a contextual response from Claude using the user's API key.
- [ ] AI responses reference the actual recipe (e.g., answering "how much garlic?" with the correct quantity from the ingredient list at current scale).
- [ ] Time expressions in step text render as tappable timer badges. Tapping starts a visible countdown. Audio alert on completion.
- [ ] Multiple timers can run simultaneously and display in the timer strip.
- [ ] Wake lock prevents screen dimming. Releasing cooking mode releases the lock.
- [ ] Cooking mode uses the high-contrast dark-green-on-cream palette from the design system.
- [ ] On browsers without Web Speech API support, voice features are hidden; tap/swipe still work.

## Open questions

- **Voice command language.** English only for MVP? The Web Speech API supports locale — should we match the app's language setting?
- **Timer audio.** What sound? A gentle chime, not a jarring alarm. Should we bundle a sound file or use Web Audio API synthesis?
- **AI rate limiting.** Should we cap cooking-chat calls per session (e.g., max 20 questions) to prevent accidental cost runaway? Or trust the user since it's their key?
- **Step text size.** 24px? 28px? 32px? Needs user testing from ~1 meter distance. Consider a text-size slider in cooking mode settings.

## Changelog

- 2026-05-02 — initial draft. Captured immersive step view, voice nav (Web Speech API), tap-to-read TTS, AI chat with recipe context, inline timer detection, wake lock, and acceptance criteria.
