# Capture flow (photo → AI extraction → confirm)

**Status:** draft
**Last updated:** 2026-04-30
**Owner:** Kaz

## Summary

The single most-used path in the app: a user sees a recipe (cookbook page, screenshot, friend's handwritten card), takes a photo, and ends up with a structured recipe in their collection. Target: under 60 seconds end-to-end, with no re-typing.

## User story

> As a user with a cookbook open in front of me, I want to snap one (or two) photos, glance at what the AI extracted, fix anything obviously wrong, and save — without leaving the page.

## Flow

```
[Tap "Capture"] → [Camera or upload] → [Preview + retake/add page] →
  [Submit] → [Streaming extraction with progress] →
    [Confirm/edit form pre-filled with extraction] →
      [Save to folder, optional tags] → [Done — view recipe]
```

Failure branches:
- **Extraction fails** (model error, malformed JSON): show the error, the original photo, and an "Edit manually" button that opens an empty form with the photo attached.
- **Extraction succeeds but is obviously wrong** (e.g. ingredients list is empty): same form, with whatever fields *did* parse pre-filled. The user owns the final state.
- **User abandons mid-flow:** the photo + partial extraction is saved as a **draft** under Inbox, recoverable from a "Drafts" list.

## Requirements

### Must have

- **Camera-or-upload entry point**, mobile-first. On phones, the native camera UI opens via `<input type="file" accept="image/*" capture="environment">`. No custom in-browser camera component for MVP — the OS camera is faster and known-good.
- **Multi-photo capture** for recipes that span pages or have ingredients on the back. Up to 4 photos per capture. Order matters (photo 1 first, etc.).
- **Streaming extraction** — render fields as the model emits them so the user sees progress, not a spinner. Anthropic's streaming API supports this; we display partial JSON as it materializes.
- **Pre-filled confirm/edit form** with every field editable. Same form serves "fix the AI's output" and "type a recipe in by hand" — there is no separate manual-entry surface.
- **Folder selection + tag input** on the confirm screen. Default folder is Inbox; the user can override or create a new folder inline. Tags autocomplete from existing tags but accept new strings.
- **Save persists** the recipe row, attached photos in `recipe-photos/{user_id}/{recipe_id}/`, and any new tags / folders.
- **Drafts:** if the user navigates away after upload but before save, the in-progress capture is preserved as a draft (photos + partial extraction). Drafts surface in a dedicated list and can be resumed.

### Should have

- **Retake / remove individual photos** before submit. Re-ordering by drag, but if dragging is too costly for MVP, simple up/down buttons.
- **Compression on the client** before upload — long edge to ~2000px JPEG, target < 600KB per photo. Vision models don't need higher.
- **"Re-extract"** action on the confirm screen — if the user thinks the AI got it wrong, they can re-run extraction (counts against their token budget). If any field has been edited, show a warning: "Re-extract will replace your edits. Continue?" — no silent merging. Optional: choose a different model for the retry (Sonnet ↔ Haiku).
- **Token cost estimate** shown before tapping "Extract" — rough character/byte estimate based on photo count and selected model. Not exact, but enough to avoid surprises.

### Won't have (this round)

- **In-browser custom camera UI** (overlays, edge guides, multi-shot stitching). The OS camera is sufficient.
- **Background extraction** (close the tab, get a notification when done). Extraction holds the open tab. If the user navigates away, the partial state becomes a draft.
- **OCR pre-pass.** The vision model handles handwriting and printed text directly; no Tesseract step. If quality is bad we revisit.
- **Voice input** ("Hey, capture this recipe"). No.
- **Auto-detection** of "is this a recipe?" before calling the model. We trust the user.

## UX shape

### Entry

A floating "Capture" button on the recipe list / folder views. On the confirm screen this same button is replaced by Save / Cancel.

### Capture screen

- Stack of photo thumbnails as they're added. Tap "+" to add another (re-opens OS camera).
- "Submit for extraction" CTA shows the photo count + estimated tokens.
- Cancel returns to where you came from; nothing is saved.

### Streaming extraction screen

- The original photos shrink to a small strip at top; the form scaffolds in below as fields stream from the model.
- Title appears first, then default servings, ingredients (one at a time), then steps.
- A subtle progress affordance ("Extracting — 12 ingredients so far") so the user knows it's alive.

### Confirm / edit screen

- Same form as manual entry. Every field editable. Original photos visible at the top, expandable.
- Folder dropdown (default: Inbox; "+ New folder" option), tag chip input, source/notes.
- Bottom: "Re-extract" (secondary, costs tokens), "Save" (primary), "Save as draft" (tertiary).

## Extraction call shape (informational)

Detailed in `04-llm-integration.md`. Headline: a single call to Claude with up to 4 photos in the messages array, asking for a JSON object that matches our `Recipe` schema. We use **structured outputs** (JSON schema in the request) so we don't have to robustness-parse free-form text. Streaming on; partial JSON is parsed permissively as fields complete.

## Acceptance criteria

- [ ] Tapping "Capture" on phone opens the OS camera (verified on iOS Safari and Android Chrome).
- [ ] Up to 4 photos can be added per capture, removed, and re-ordered.
- [ ] Photos are compressed client-side before upload (verified by inspecting upload payload size).
- [ ] During extraction, fields appear in the form as the model emits them — not just a spinner.
- [ ] Extraction failure shows the original photos and an "Edit manually" path to an empty-but-photo-attached form.
- [ ] Saving with no folder selected lands the recipe in Inbox.
- [ ] Saving with a freshly-typed tag creates the tag and attaches it.
- [ ] Navigating away mid-flow with photos uploaded creates a draft, recoverable from the Drafts list.
- [ ] No raw API key is ever sent to the browser; the extraction call originates from the server (see `04-llm-integration.md`).

## Decisions locked (2026-04-30)

- **Default model:** Claude Sonnet 4.6 for first-impression accuracy on cookbook pages and handwriting. Haiku 4.5 is a setting users can switch to for cheaper/faster extraction. Details in `04-llm-integration.md`.
- **Re-extract behavior:** if any field is edited, warn before replacing. No silent merge. The button label and confirm dialog make replacement explicit.

## Open questions

- **Cost estimate fidelity.** Rough estimate ("~3K input tokens, ~1K output → ~\$0.02") or precise dry-run? Anthropic doesn't expose a free dry-run, so any estimate is heuristic. Resolve in `04-llm-integration.md`.
- **Photo ordering for multi-page captures.** Let the model figure out continuity, or pass an explicit "page 1 of 2" hint in the prompt? Latter is more reliable but is a small UI nit.
- **Drafts retention.** How long do drafts live before auto-purge? Forever, 30 days, indefinite-but-soft-warned? Probably forever for MVP — reconsider if it bloats storage.

## Changelog

- 2026-04-30 — initial draft. Captured the capture flow, multi-photo support, streaming extraction UX, draft handling, acceptance criteria, and open questions.
- 2026-04-30 — locked: default extraction model is Sonnet 4.6 (Haiku 4.5 opt-in); re-extract warns before discarding user edits.
