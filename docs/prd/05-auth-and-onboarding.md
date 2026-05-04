# Auth & onboarding

**Status:** draft
**Last updated:** 2026-05-04
**Owner:** Kaz

## Summary

The shape of how a user signs in and returns afterward. cuckoobook is a closed, invite-only tool for a fixed set of accounts (currently `anto@cuckoobook.com` and `kaz@cuckoobook.com`); there is no public signup. Goal: from "open the link" to "ready to capture my first recipe" in well under a minute.

## User story

> As an existing user, I open the app, type my email and password, and land on my recipe list. I can change my password from the settings page if I want.

## Flow

### Sign in

```
[Landing] → enter email + password → [Recipe list]
```

### Returning user

Email/password login establishes a session via Supabase's auth cookie. On any page that requires data (everything except the public landing and `/sign-in`), redirect to sign-in if no session.

### Sign out

Single button in settings (and a quick action in the recipes header). Clears the session. Recipes / photos remain server-side; signing back in restores access.

### Password change

Settings page → "Change password" form (`new password` + `confirm`). Calls `supabase.auth.updateUser({ password })`. No "current password" prompt for MVP — sessions are short-lived enough that this is acceptable for a two-user tool.

## Requirements

### Must have

- **Email + password auth** via Supabase. Sign-in only — no public signup. Session lifetime: Supabase default (1 hour JWT, with refresh-token rotation), refreshed on use.
- **Closed account list.** Supabase `auth.enable_signup` and `auth.email.enable_signup` are both `false`. New accounts are seeded directly into the database (see `supabase/seed.sql`); the app exposes no signup UI.
- **Default values seeded on signup.** When a new row is inserted into `auth.users` (whether by seed or future admin tooling), an "Inbox" folder and default `user_preferences` row are created automatically by the `handle_new_user()` trigger.
- **Settings page** with: profile (email, sign out), password change. Future additions (units preference, Anthropic key, default model, usage summary) live here too.
- **Route protection.** All app routes outside `/` and `/sign-in` require an authenticated session. Enforcement is a **client-side guard** (`<AuthGate>` wrapping the root layout) plus **Supabase Row Level Security** on every user-owned table. The guard renders a sign-in redirect before any data fetch fires; RLS guarantees that even if the guard is bypassed, no other user's rows are accessible. Earlier drafts specified a server-rendered redirect via Next.js middleware; that was dropped when the app moved to a static export hosted on DigitalOcean App Platform's free Static Site tier (no server runtime available).
- **Password change.** Authenticated users can set a new password from `/settings`. Validation: minimum 6 characters (Supabase's `minimum_password_length`), confirm-field must match.
- **Inbox folder is permanent.** Cannot be renamed or deleted.

### Should have

- **Anthropic key entry on the settings page.** As specified in `04-llm-integration.md`: paste, validate with a tiny test call, persist. Replacing re-validates.
- **Unit preference toggle on the settings page.** Metric / Imperial. Default seeded as `metric` in the DB; user can flip it.
- **Account deletion (admin-only).** Removing a row from `auth.users` cascades to all user-owned tables (folders, recipes, etc.). Done out-of-band via Supabase Studio for the closed-account model; no in-app self-service.
- **Data export.** Settings → "Export everything" generates a JSON file of all recipes (with photo URLs) plus a zip of photos. Useful for trust ("my data is mine").

### Won't have (this round)

- **Magic-link auth.** Email + password only.
- **Public signup.** Closed list maintained via seed / admin tooling.
- **Password reset email.** With two known users, password recovery is handled out-of-band (reset directly in Supabase Studio). Revisit if the user list grows.
- **2FA / passkeys.** Email + password is the bar.
- **Team / shared workspaces.** Single user per account. Sharing a recipe (post-MVP) is link-based, not account-based.
- **OAuth providers.** Email + password only for MVP.
- **Onboarding wizard.** Removed for the closed-account model — units default to `metric`, the Anthropic key is entered on the settings page when the user wants to capture, and there's no welcome screen.

## UX shape

### Landing (signed out)

Minimal: app name, one sentence ("invite-only — sign in with your existing account"), an email field, a password field, a "Sign in" button. No marketing pages — this is a personal tool. No sign-up link.

### Settings

Single page, sectioned. MVP only ships profile + password; preference / key / usage sections land later as listed in **Should have**.

```
┌──────────────────────────────────────────────┐
│ Profile                                      │
│   email@example.com           [Sign out]     │
│                                              │
│ Password                                     │
│   New password         [           ]         │
│   Confirm new password [           ]         │
│   [Update password]                          │
│                                              │
│ Preferences (later)                          │
│   Units             ( Metric ) [ Imperial ]  │
│   Default model     ( Sonnet ) [ Haiku ]     │
│                                              │
│ Anthropic API key (later)                    │
│   ●●●●●●●●  last validated 5 days ago        │
│   [Replace key]                              │
│                                              │
│ Usage this month (later)                     │
│   23 extractions • ~210K input tokens        │
│   ~12K output tokens • ~$0.78 estimated      │
└──────────────────────────────────────────────┘
```

## Acceptance criteria

- [ ] An unauthenticated user hitting any app route outside `/` and `/sign-in` is redirected to `/sign-in` by the client-side `<AuthGate>` before any protected content renders.
- [ ] Even without the client guard, RLS prevents an unauthenticated browser from reading any row from `recipes`, `folders`, `user_preferences`, etc.
- [ ] A user submits valid email + password and lands on `/recipes`. Invalid credentials show an inline error and stay on the page.
- [ ] The seeded users (`anto@cuckoobook.com`, `kaz@cuckoobook.com`) can sign in immediately after `supabase db reset`.
- [ ] Each seeded user has an "Inbox" folder and a default `user_preferences` row.
- [ ] Public sign-up is impossible: `auth.signUp` requests against the API are rejected, and the UI offers no signup affordance.
- [ ] An authenticated user can change their password from `/settings`. The new password works on the next sign-in; the old one no longer does.
- [ ] Sign-out clears the session and returns to the landing page. Signing back in restores all recipes.

## Open questions

- **Password recovery.** For a closed two-user tool, resetting via Supabase Studio is fine. If we ever invite a third user, decide whether to add the email-link reset flow.
- **Anthropic key entry surface.** PRD currently says "settings page". Confirm we don't need a forced first-time prompt on the capture screen when no key is set.
- **Empty-state guidance.** With no recipes saved, does the recipe list show a sample / mock recipe, or an empty-state illustration with a Capture CTA? Probably the latter — sample recipes muddy "this is *my* collection." (Carried over from the previous draft.)

## Changelog

- 2026-05-04 — route protection moved from Next.js middleware (server-rendered redirect) to a client-side `<AuthGate>` + RLS, in service of hosting on DO App Platform's free Static Site tier (no server runtime). Acceptance criteria updated accordingly.
- 2026-05-03 — switched from magic-link to email + password. Closed the signup path; users are seeded via `supabase/seed.sql`. Removed onboarding wizard from MVP scope. Added settings page with password-change form.
- 2026-04-30 — initial draft. Captured magic-link flow, three-step onboarding wizard, settings layout, acceptance criteria, and open questions.
