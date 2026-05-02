@apps/web/AGENTS.md

# Project rules

## Workflow

- **PRD-first.** For any non-trivial feature, read `docs/prd/` first and update the relevant PRD before writing code. If the PRD doesn't exist yet, draft it from `docs/prd/_template.md` and confirm with the user before implementing.
- Keep code changes scoped to what the current task asks for. Don't bundle drive-by refactors into feature PRs.
- When requirements shift mid-task, update the PRD file in the same change — chat context is not durable.

## Repo layout

This is a **pnpm monorepo**:

- `apps/web/` — Next.js 16 app (App Router, Turbopack, Tailwind v4)
- `packages/ui/` — shared component library (`@cuckoobook/ui`), ported from `immergine/packages/ui`. SCSS-modules + Radix primitives, themed via `data-theme="theme-1" | "theme-2"`. Storybook + Vitest set up here.
- `packages/eslint-config/` — shared ESLint flat configs (`@cuckoobook/eslint-config`)
- `packages/typescript-config/` — shared `tsconfig` bases (`@cuckoobook/typescript-config`)

Workspaces are declared in `pnpm-workspace.yaml`. Cross-package imports use `@cuckoobook/*`.

## UI components

**You MUST use `@cuckoobook/ui` components instead of raw HTML elements when one exists.** Before writing `<button>`, `<input>`, `<textarea>`, `<select>`, `<dialog>`, etc., check `packages/ui/src/` first. Available components: Accordion, Avatar, Badge, Banner, Button, ButtonTabs, Card, Checkbox, Chip, Code, DatePicker, Dialog, DropdownMenu, Logo, Pagination, ProgressIndicator, RadioSelector, Select, Slider, Switch, Tabs, Tag, TextArea, TextField, Toast, Toggle, ToggleGroup, Tooltip.

Specific guidance:

- **Buttons:** `<Button variant tone size>`. Never write a styled `<button>` or a `<div role="button">`.
- **Button as link:** `<Button asChild><Link href="...">…</Link></Button>` — the underlying Radix Primitive forwards `asChild`. Don't replicate Button styles on a raw `<a>` or `<Link>`.
- **Form inputs:** `<TextField>`, `<TextArea>`, `<Checkbox>`, `<RadioSelector>`, `<Select>`, `<Switch>`, `<Slider>` with their `label`, `error`, `message`, and `disabled` props. Don't construct labels and error text by hand.
- **Status messages** (success/error/info notifications): `<Banner variant="success" | "error" | "warning" | "info" heading="…" body="…">`. Don't roll a styled div with an icon.
- **Modals / sheets:** `<Dialog>` family. Don't create a fixed-positioned overlay by hand.
- **Tooltips:** `<Tooltip>` family wrapping a trigger. Don't use the `title` attribute on interactive elements.

If a needed pattern doesn't exist in `@cuckoobook/ui` yet, **promote it into the package** rather than forking a one-off styled element into the app: add `packages/ui/src/ComponentName/{index.tsx, index.module.scss, ComponentName.stories.tsx, ComponentName.test.tsx}` following the existing convention. Tailwind utility classes are fine for layout (flex, grid, gap, padding) but not as a substitute for a missing component.

Other UI rules:

- **All SCSS uses nesting.** Don't write flat selectors in `.scss` files.
- **Theming:** only use the `themify` mixin and `theme.get()` (from `packages/ui/styles/_themes.scss`) for values that vary by theme. Use SCSS variables from `packages/ui/styles/_variables.scss` (or plain values) for anything constant.
- A parent element must set `data-theme="theme-1"` (or `theme-2`) for component theme variables to apply — already wired in `apps/web/app/layout.tsx`.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Tailwind CSS v4** in `apps/web`.
- **pnpm** is the only supported package manager. Don't introduce npm or yarn lockfiles.
- Next.js 16 has breaking changes from older versions; consult `node_modules/next/dist/docs/` (per `AGENTS.md`) before relying on training-data knowledge for routing, caching, or server-component APIs.

## Code style

- TypeScript everywhere.
- Prefer Server Components by default; mark Client Components with `"use client"` only when interactivity, browser APIs, or React state are actually needed.
- Tailwind v4 uses CSS-first config (`@theme` in `app/globals.css`). Don't add `tailwind.config.js` unless a plugin requires it.
- No comments that restate the code. Add a comment only when the *why* would surprise the next reader.
- Don't add error handling, fallbacks, or validation for situations that can't happen. Trust internal call sites; validate at system boundaries (user input, network, external APIs).

## Commands

Root-level (run from repo root):

- `pnpm dev` — start the web app dev server
- `pnpm build` — build everything (`pnpm -r build`)
- `pnpm lint` — lint everything
- `pnpm test` — run all package tests
- `pnpm check-types` — typecheck all packages

Package-scoped (use `pnpm --filter <name> <script>`):

- `pnpm --filter @cuckoobook/ui storybook` — run the component Storybook on :6006
- `pnpm --filter @cuckoobook/ui test` — run UI vitest suite

## Before declaring a task done

- Run `pnpm lint` and `pnpm build`. Both must pass.
- If you touched `packages/ui`, also run `pnpm --filter @cuckoobook/ui test` and `pnpm --filter @cuckoobook/ui check-types`.
- For UI changes, exercise the feature in a browser (`pnpm dev`) — type checks don't catch broken UX.
- Update the relevant PRD's `## Changelog` if the change altered scope or behavior the PRD described.

## Out of scope unless asked

- Adding a database, auth provider, ORM, or deployment config.
- Reformatting unrelated files or upgrading dependencies opportunistically.
- Adding turbo, nx, or other build orchestrators on top of pnpm workspaces.
