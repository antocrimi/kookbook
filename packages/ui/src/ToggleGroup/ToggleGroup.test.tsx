import { FontBoldIcon, FontItalicIcon, UnderlineIcon } from "@radix-ui/react-icons";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, test, vi } from "vitest";
import { Toggle } from "../Toggle/index";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { ToggleGroup } from "./index";

describe("ToggleGroup", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders toggle children", () => {
    render(
      <ToggleGroup type="single" aria-label="Text formatting">
        <Toggle aria-label="Bold" icon={<FontBoldIcon />} value="bold" />
        <Toggle aria-label="Italic" icon={<FontItalicIcon />} value="italic" />
        <Toggle aria-label="Underline" icon={<UnderlineIcon />} value="underline" />
      </ToggleGroup>,
    );

    expect(screen.getByLabelText("Bold")).toBeInTheDocument();
    expect(screen.getByLabelText("Italic")).toBeInTheDocument();
    expect(screen.getByLabelText("Underline")).toBeInTheDocument();
  });

  it("emits onValueChange for single selection", () => {
    const onValueChange = vi.fn();

    render(
      <ToggleGroup type="single" aria-label="Text formatting" onValueChange={onValueChange}>
        <Toggle aria-label="Bold" icon={<FontBoldIcon />} value="bold" />
        <Toggle aria-label="Italic" icon={<FontItalicIcon />} value="italic" />
      </ToggleGroup>,
    );

    fireEvent.click(screen.getByLabelText("Italic"));

    expect(onValueChange).toHaveBeenCalledWith("italic");
  });

  it("emits onValueChange for multiple selection", () => {
    const onValueChange = vi.fn();

    render(
      <ToggleGroup
        type="multiple"
        aria-label="Text formatting"
        defaultValue={["bold"]}
        onValueChange={onValueChange}
      >
        <Toggle aria-label="Bold" icon={<FontBoldIcon />} value="bold" />
        <Toggle aria-label="Italic" icon={<FontItalicIcon />} value="italic" />
      </ToggleGroup>,
    );

    fireEvent.click(screen.getByLabelText("Italic"));

    expect(onValueChange).toHaveBeenCalledWith(["bold", "italic"]);
  });

  it("supports children without explicit value by assigning an internal item value", () => {
    const onValueChange = vi.fn();

    render(
      <ToggleGroup type="single" aria-label="Text formatting" onValueChange={onValueChange}>
        <Toggle aria-label="Bold" icon={<FontBoldIcon />} />
        <Toggle aria-label="Italic" icon={<FontItalicIcon />} />
      </ToggleGroup>,
    );

    fireEvent.click(screen.getByLabelText("Italic"));

    expect(onValueChange).toHaveBeenCalledWith("toggle-1");
  });

  test.each(["sm", "md", "lg"] as const)("captures %s size rendering", (size) => {
    const { container } = render(
      <ToggleGroup type="single" aria-label={`Formatting ${size}`} size={size} defaultValue="bold">
        <Toggle aria-label="Bold" icon={<FontBoldIcon />} value="bold" />
        <Toggle aria-label="Italic" icon={<FontItalicIcon />} value="italic" />
      </ToggleGroup>,
    );

    expectSnapshotWithWarning(container.innerHTML, `size-${size}`);
  });

  it("captures multiple variant rendering", () => {
    const { container } = render(
      <ToggleGroup
        type="multiple"
        aria-label="Text formatting"
        defaultValue={["bold", "italic"]}
      >
        <Toggle aria-label="Bold" icon={<FontBoldIcon />} value="bold" />
        <Toggle aria-label="Italic" icon={<FontItalicIcon />} value="italic" />
        <Toggle aria-label="Underline" icon={<UnderlineIcon />} value="underline" />
      </ToggleGroup>,
    );

    expectSnapshotWithWarning(container.innerHTML, "variant-multiple");
  });

  it("captures disabled rendering", () => {
    const { container } = render(
      <ToggleGroup type="single" aria-label="Text formatting" defaultValue="bold" disabled>
        <Toggle aria-label="Bold" icon={<FontBoldIcon />} value="bold" />
        <Toggle aria-label="Italic" icon={<FontItalicIcon />} value="italic" />
      </ToggleGroup>,
    );

    expectSnapshotWithWarning(container.innerHTML, "disabled");
  });
});
