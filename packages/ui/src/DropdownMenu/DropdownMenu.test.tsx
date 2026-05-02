import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, test, vi } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
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
 * DropdownMenu tests.
 *
 * Radix DropdownMenu uses portals for the Content surface, so the
 * menu items are rendered into a portal node attached to document.body
 * rather than the testing-library default container. We use
 * `screen.getByRole` (which queries the whole document) instead of
 * `container.querySelector`.
 *
 * `defaultOpen` opens the menu without needing a click + animation
 * frame, which keeps the tests synchronous.
 */
describe("DropdownMenu", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the trigger", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Action</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("renders items when open", () => {
    // Use defaultOpen to render the menu without simulating the
    // pointerdown event Radix listens for. fireEvent.click doesn't
    // trigger Radix's pointerdown handler in jsdom — Radix's own
    // test suite covers the click-to-open behaviour.
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
          <DropdownMenuItem>Two</DropdownMenuItem>
          <DropdownMenuItem>Three</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByRole("menuitem", { name: "One" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Two" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Three" })).toBeInTheDocument();
  });

  it("calls onSelect when an item is clicked", () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Click me</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    fireEvent.click(screen.getByRole("menuitem", { name: "Click me" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders a separator and a label", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Section header</DropdownMenuLabel>
          <DropdownMenuItem>One</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Two</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByText("Section header")).toBeInTheDocument();
    // Radix marks separators with role="separator"
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("applies the destructive variant class on items", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const item = screen.getByRole("menuitem", { name: "Delete" });
    expect(item.className).toMatch(/variant-destructive/);
  });

  it("default variant does not apply the destructive class", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Plain</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const item = screen.getByRole("menuitem", { name: "Plain" });
    expect(item.className).toMatch(/variant-default/);
    expect(item.className).not.toMatch(/variant-destructive/);
  });

  it("renders a submenu trigger", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More options</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Nested action</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    // The submenu trigger has role="menuitem" with aria-haspopup="menu"
    const subTrigger = screen.getByRole("menuitem", { name: /More options/ });
    expect(subTrigger).toBeInTheDocument();
    expect(subTrigger).toHaveAttribute("aria-haspopup", "menu");
  });

  it("forwards arbitrary props to the trigger", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="custom-trigger">Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByTestId("custom-trigger")).toBeInTheDocument();
  });

  it("respects disabled item state", () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onSelect={onSelect}>
            Disabled
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const item = screen.getByRole("menuitem", { name: "Disabled" });
    expect(item).toHaveAttribute("data-disabled");

    fireEvent.click(item);
    expect(onSelect).not.toHaveBeenCalled();
  });

  /* ─────────────────────────────────────────────
   * Snapshot tests
   * ─────────────────────────────────────────────
   *
   * Capture the rendered menu surface across themes and item
   * variants. Uses `baseElement.innerHTML` rather than
   * `container.innerHTML` because Radix portals the menu Content
   * into document.body — the test container only holds the trigger.
   * `baseElement` is RTL's reference to document.body.
   *
   * Snapshot mismatches are downgraded to warnings via
   * `expectSnapshotWithWarning` (matches Select's pattern). They
   * exist to flag visual regressions during review, not to gate
   * the build.
   */

  test.each([
    ["theme-dark-basic", "theme-1"],
    ["theme-light-basic", "theme-2"],
  ] as const)("captures %s rendering", (snapshotName, themeName) => {
    const { baseElement } = render(
      <div data-theme={themeName}>
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>New file</DropdownMenuItem>
            <DropdownMenuItem>Open file</DropdownMenuItem>
            <DropdownMenuItem>Save file</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>,
    );

    expectSnapshotWithWarning(baseElement.innerHTML, snapshotName);
  });

  test.each([
    ["theme-dark-with-destructive", "theme-1"],
    ["theme-light-with-destructive", "theme-2"],
  ] as const)("captures %s rendering", (snapshotName, themeName) => {
    const { baseElement } = render(
      <div data-theme={themeName}>
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Project</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>,
    );

    expectSnapshotWithWarning(baseElement.innerHTML, snapshotName);
  });

  test.each([
    ["theme-dark-with-separator-and-label", "theme-1"],
    ["theme-light-with-separator-and-label", "theme-2"],
  ] as const)("captures %s rendering", (snapshotName, themeName) => {
    const { baseElement } = render(
      <div data-theme={themeName}>
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>File</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>File operations</DropdownMenuLabel>
            <DropdownMenuItem>New</DropdownMenuItem>
            <DropdownMenuItem>Open</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Recent</DropdownMenuLabel>
            <DropdownMenuItem>Recent project A</DropdownMenuItem>
            <DropdownMenuItem>Recent project B</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>,
    );

    expectSnapshotWithWarning(baseElement.innerHTML, snapshotName);
  });
});
