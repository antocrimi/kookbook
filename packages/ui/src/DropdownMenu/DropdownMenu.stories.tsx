import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/index";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./index";

/**
 * DropdownMenu stories.
 *
 * Stories are exported in alphabetical order so the Storybook sidebar
 * lists them in a stable, predictable sequence.
 *
 * All stories use the canonical `<DropdownMenuTrigger asChild><Button>...</Button>`
 * pattern. The Trigger is intentionally unstyled by default — consumers
 * wrap their own button (or any clickable element) via Radix's `asChild`
 * so the trigger can be styled to match the surrounding UI without
 * coupling to a specific component shape.
 */

const meta = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  decorators: [
    (Story) => (
      <div
        style={{
          padding: "32px",
          width: "100%",
          maxWidth: "760px",
          minHeight: "320px",
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Three menus side-by-side demonstrating the `align` prop on
 * `DropdownMenuContent`. The trigger is the same width in all three;
 * only the alignment of the menu surface relative to the trigger
 * changes.
 *
 * - `align="start"`  → menu's left edge aligns with the trigger's left edge (LTR)
 * - `align="center"` → menu is centred on the trigger (default)
 * - `align="end"`    → menu's right edge aligns with the trigger's right edge (LTR)
 *
 * Use `start`/`end` rather than `left`/`right` for correct RTL behaviour
 * — in RTL languages, `start` is the right side.
 */
export const Aligned: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "48px",
        width: "100%",
      }}
    >
      <div>
        <p style={{ marginBottom: "12px", fontSize: "12px", opacity: 0.7 }}>
          align=&quot;start&quot;
        </p>
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="md">
              Trigger
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Action one</DropdownMenuItem>
            <DropdownMenuItem>Action two</DropdownMenuItem>
            <DropdownMenuItem>Action three</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <p style={{ marginBottom: "12px", fontSize: "12px", opacity: 0.7 }}>
          align=&quot;center&quot; (default)
        </p>
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="md">
              Trigger
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem>Action one</DropdownMenuItem>
            <DropdownMenuItem>Action two</DropdownMenuItem>
            <DropdownMenuItem>Action three</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <p style={{ marginBottom: "12px", fontSize: "12px", opacity: 0.7 }}>
          align=&quot;end&quot;
        </p>
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="md">
              Trigger
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Action one</DropdownMenuItem>
            <DropdownMenuItem>Action two</DropdownMenuItem>
            <DropdownMenuItem>Action three</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  ),
};

/**
 * Three plain action items, no separator. The simplest case.
 */
export const Basic: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="md">
          Open menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => console.log("New file")}>
          New file
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => console.log("Open file")}>
          Open file
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => console.log("Save file")}>
          Save file
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/**
 * The exact shape COL-108 (Canvas project navigation refactor) will
 * consume: a submenu of recent projects + an "All projects" link, an
 * action to create a new project, a project details navigation, and
 * a destructive delete action. This is the canonical proof-of-shape
 * for the canvas refactor.
 *
 * Note the trigger is a `Button variant="ghost"` to mirror how the
 * canvas nav uses `variant="ghost"` for the existing project Select.
 */
export const MixedItems: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="md">
          My current project ▾
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Open project</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Ocean Meditation</DropdownMenuItem>
            <DropdownMenuItem>Data Tunnel Prototype</DropdownMenuItem>
            <DropdownMenuItem>Gallery Walk</DropdownMenuItem>
            <DropdownMenuItem>Aurora Borealis</DropdownMenuItem>
            <DropdownMenuItem>Untitled</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>All projects</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem>+ New project</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Project details</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete project</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/**
 * A destructive action item that's visually distinct from the rest of
 * the menu. Use for delete / remove / clear flows.
 */
export const WithDestructiveItem: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="md">
          Project
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete project</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/**
 * A disabled item is greyed out and doesn't fire its onSelect.
 */
export const WithDisabledItem: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="md">
          Edit
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Cut</DropdownMenuItem>
        <DropdownMenuItem>Copy</DropdownMenuItem>
        <DropdownMenuItem disabled>Paste (nothing in clipboard)</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Select all</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/**
 * A separator between two groups of items, plus section labels.
 */
export const WithSeparator: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="md">
          File
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>File operations</DropdownMenuLabel>
        <DropdownMenuItem>New</DropdownMenuItem>
        <DropdownMenuItem>Open</DropdownMenuItem>
        <DropdownMenuItem>Save</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Recent</DropdownMenuLabel>
        <DropdownMenuItem>Recent project A</DropdownMenuItem>
        <DropdownMenuItem>Recent project B</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/**
 * A submenu nested inside the main menu.
 */
export const WithSubmenu: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="md">
          Open menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Top-level action</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More options</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Nested action one</DropdownMenuItem>
            <DropdownMenuItem>Nested action two</DropdownMenuItem>
            <DropdownMenuItem>Nested action three</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem>Another top-level action</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
