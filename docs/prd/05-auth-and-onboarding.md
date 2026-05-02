# Auth & onboarding

**Status:** draft
**Last updated:** 2026-04-30
**Owner:** Kaz

## Summary

The shape of how a user signs in for the first time, sets up their preferences and Anthropic key, and returns afterward. Goal: from "open the link" to "ready to capture my first recipe" in under two minutes, with no passwords to remember.

## User story

> As a new user opening the app for the first time, I want to enter my email, click a link, set up my key and units once, and be on the capture screen — with everything I need to actually save a recipe.

## Flow

### First-time sign-in

```
[Landing] → enter email → check inbox → click magic link →
  [Onboarding wizard]
    1. Welcome (one screen, what the app is)
    2. Units (metric / imperial)
    3. Anthropic API key (paste + validate)
    4. Done → recipe list (empty, with prominent "Capture" CTA)
```

### Returning user

Magic link establishes a session. Persistent session via Supabase's auth cookie. On any page that requires data (everything except the public landing), redirect to sign-in if no session.

### Sign out

Single button in settings. Clears the session. Recipes / photos remain server-side; signing back in restores access.

## Requirements

### Must have

- **Magic-link auth** via Supabase. Email entry → "we sent you a link" screen → click link → signed in. Session lifetime: 30 days, refreshed on use.
- **First-run wizard** that runs once after a user signs up (or after an existing user logs in for the first time on a new device, if no preferences are set on their account). Three steps: welcome, units, key.
- **Default values seeded on signup**: an "Inbox" folder is created. Unit preference defaults to whatever the user's locale suggests (`navigator.language` heuristic), but the wizard step asks explicitly.
- **Settings page** with: profile (email, sign out), unit preference, Anthropic key (replace, never view), default extraction model, "Usage this month" summary.
- **Route protection.** All app routes outside `/`, `/sign-in`, `/auth/callback` require an authenticated session. Server-rendered redirect, not client-only.
- **Key validation on save.** As specified in `04-llm-integration.md`: on first-time entry and on any update, make a tiny test call before persisting.
- **Inbox folder is permanent.** Cannot be renamed or deleted. (Renamable folders make this UX rule confusing — easier to fix the rule.)

### Should have

- **Resume onboarding.** If the user closes the wizard mid-way (e.g. doesn't have their key handy), they're sent to a "Setup incomplete" screen with the remaining steps. Capture is gated behind completing key setup; folders / list views are accessible.
- **Recovery for expired magic links.** Expired link page suggests "request a new one" with the same email pre-filled.
- **Account deletion (self-service).** Settings → "Delete my account" with double-confirm. Hard-deletes recipes, folders, tags, photos, key, and the auth user. No soft delete in MVP (no undo period).
- **Data export.** Settings → "Export everything" generates a JSON file of all recipes (with photo URLs) plus a zip of photos. Useful for trust ("my data is mine"). Lower priority than deletion.

### Won't have (this round)

- **Email + password.** Magic link only.
- **Multiple devices managed explicitly.** Sessions per device exist (Supabase tracks them) but no UI to "sign out other devices" in MVP.
- **2FA / passkeys.** Magic link is the bar.
- **Team / shared workspaces.** Single user per account. Sharing a recipe (post-MVP) is link-based, not account-based.
- **OAuth providers.** Magic link only for MVP. Google as a fast follow.

## UX shape

### Landing (signed out)

Minimal: app name, one sentence, an email input, a "Send me a link" button. No marketing pages — this is a personal tool. The email field doubles as both sign-up and sign-in (Supabase magic link is identical for both).

### Onboarding wizard

Three steps, ~30 seconds each, dismissible only after all are completed (or "skip key for now" — but capture is then disabled until key is set).

1. **Welcome.** One screen, three lines: "Capture recipes from photos. They become interactive — scale servings, switch units. Your collection, your AI credits." Continue button.
2. **Units.** Two big toggles: Metric / Imperial. Pre-selected based on `navigator.language` (`en-US` → Imperial, else Metric). Continue.
3. **Anthropic key.** Field with a paste affordance, link to console.anthropic.com to create one, and a "Validate & save" button. Validation in-place (loading state). On success, "All set — let's capture your first recipe." On failure, inline error.

### Settings

Single page, sectioned:

```
┌──────────────────────────────────────────────┐
│ Profile                                      │
│   email@example.com           [Sign out]     │
│                                              │
│ Preferences                                  │
│   Units             ( Metric ) [ Imperial ]  │
│   Default model     ( Sonnet ) [ Haiku ]     │
│                                              │
│ Anthropic API key                            │
│   ●●●●●●●●  last validated 5 days ago        │
│   [Replace key]                              │
│                                              │
│ Usage this month                             │
│   23 extractions • ~210K input tokens        │
│   ~12K output tokens • ~$0.78 estimated      │
│                                              │
│ Danger zone                                  │
│   [Export my data]   [Delete my account]     │
└──────────────────────────────────────────────┘
```

## Acceptance criteria

- [ ] An unauthenticated user hitting any app route is redirected to sign-in (server-side).
- [ ] Magic-link emails arrive within 30 seconds; clicking the link signs in and lands on the next onboarding step or recipe list (depending on completion).
- [ ] A new user lands on the onboarding wizard after first sign-in. An "Inbox" folder exists for them in the database.
- [ ] An unset unit preference is treated as "Metric" outside `en-US`, "Imperial" inside, but the wizard always confirms.
- [ ] Capture is disabled until the Anthropic key is set and validated.
- [ ] Replacing the key in settings re-validates and persists the new encrypted secret. The old one is unrecoverable.
- [ ] Sign-out clears the session and returns to the landing page. Signing back in restores all recipes.
- [ ] Account deletion removes recipes, folders, tags, photos, the key, and the auth user. After deletion, signing in with the same email is a fresh signup.
- [ ] The "Usage this month" panel reflects extraction logs accurately.

## Open questions

- **Email-verification timing.** Supabase magic link inherently verifies; nothing further to do for first-time sign-up. Confirm we don't need a separate "confirm your email" step.
- **Multi-device migration.** If the same user signs in on a second device, are their preferences (units, default model) carried over? Yes — they're stored on the user, not the device. But we might still want to ask "is this metric or imperial?" on a new device, since locale can differ. Decide: silent (use server prefs) or re-confirm. Probably silent.
- **Empty-state guidance.** With no recipes saved, does the recipe list show a sample / mock recipe, or an empty-state illustration with a Capture CTA? Probably the latter — sample recipes muddy "this is *my* collection."
- **Account deletion grace period.** Hard delete on confirm vs. 30-day soft delete? Soft delete is friendlier but requires extra plumbing. MVP: hard delete with double-confirm, document the irreversibility.

## Changelog

- 2026-04-30 — initial draft. Captured magic-link flow, three-step onboarding wizard, settings layout, acceptance criteria, and open questions.
