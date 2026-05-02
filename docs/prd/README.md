# Product Requirements

This directory holds the living product requirements for the project. The PRD is **iterative** — expect it to change as we learn.

## Layout

- `00-overview.md` — north star, problem statement, non-goals
- `NN-<slug>.md` — one file per discrete feature, capability, or workstream
- `decisions/` — short ADR-style notes when a tradeoff is worth preserving (create on demand)

Number prefixes (`00-`, `01-`, …) keep the reading order stable. Use the next free number when adding a new doc; do not renumber existing ones.

## Conventions

- Each PRD has a **Status** line near the top: `draft`, `in-review`, `accepted`, `shipped`, or `archived`.
- Date stamps use `YYYY-MM-DD`. When a section materially changes, append an entry to a `## Changelog` section at the bottom rather than rewriting silently.
- Capture **why**, not just what. If a constraint or rejected alternative matters, write it down — code can't replay the reasoning.
- Link out to issues / tickets / Figma rather than duplicating their content here.

## Working with Claude on PRDs

- Claude should read everything under `docs/prd/` before proposing implementation work.
- When requirements change mid-task, update the relevant PRD file *first*, then write code. The PRD is the source of truth, not the chat history.
- Open questions live in a `## Open questions` section at the bottom of the relevant PRD until resolved.
