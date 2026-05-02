import { FontBoldIcon, FontItalicIcon, PlusIcon, UnderlineIcon } from "@radix-ui/react-icons";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ButtonTabs,
  ButtonTabsContent,
  ButtonTabsItem,
  ButtonTabsList,
} from "./index";

describe("ButtonTabs", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders text-only, icon-only, and text+icon button tab items", () => {
    render(
      <ButtonTabs defaultValue="text" aria-label="Button tabs demo">
        <ButtonTabsList>
          <ButtonTabsItem value="text">Text only</ButtonTabsItem>
          <ButtonTabsItem value="icon" aria-label="Bold" icon={<FontBoldIcon />} />
          <ButtonTabsItem value="mixed" icon={<PlusIcon />}>
            Mixed
          </ButtonTabsItem>
        </ButtonTabsList>
      </ButtonTabs>,
    );

    expect(screen.getByRole("tab", { name: "Text only" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Bold" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Mixed" })).toBeInTheDocument();
  });

  it("emits onValueChange when the selected button tab changes", () => {
    const onValueChange = vi.fn();

    render(
      <ButtonTabs defaultValue="text" onValueChange={onValueChange}>
        <ButtonTabsList>
          <ButtonTabsItem value="text">Text</ButtonTabsItem>
          <ButtonTabsItem value="preview">Preview</ButtonTabsItem>
        </ButtonTabsList>
        <ButtonTabsContent value="text">Text content</ButtonTabsContent>
        <ButtonTabsContent value="preview">Preview content</ButtonTabsContent>
      </ButtonTabs>,
    );

    const previewTab = screen.getByRole("tab", { name: "Preview" });

    fireEvent.mouseDown(previewTab, { button: 0, ctrlKey: false });

    expect(onValueChange).toHaveBeenCalledWith("preview");
  });

  it("renders active button tab content", () => {
    render(
      <ButtonTabs defaultValue="text">
        <ButtonTabsList>
          <ButtonTabsItem value="text">Text</ButtonTabsItem>
          <ButtonTabsItem value="preview">Preview</ButtonTabsItem>
        </ButtonTabsList>
        <ButtonTabsContent value="text">Text content</ButtonTabsContent>
        <ButtonTabsContent value="preview">Preview content</ButtonTabsContent>
      </ButtonTabs>,
    );

    expect(screen.getByText("Text content")).toBeVisible();
    expect(screen.queryByText("Preview content")).not.toBeInTheDocument();
  });

  it("captures text-only item snapshot", () => {
    const { container } = render(
      <ButtonTabs defaultValue="text-only">
        <ButtonTabsList>
          <ButtonTabsItem value="text-only">Text only</ButtonTabsItem>
          <ButtonTabsItem value="preview">Preview</ButtonTabsItem>
        </ButtonTabsList>
      </ButtonTabs>,
    );

    expect(container.innerHTML).toMatchSnapshot("item-text-only");
  });

  it("captures icon-only item snapshot", () => {
    const { container } = render(
      <ButtonTabs defaultValue="italic">
        <ButtonTabsList>
          <ButtonTabsItem value="bold" aria-label="Bold" icon={<FontBoldIcon />} />
          <ButtonTabsItem value="italic" aria-label="Italic" icon={<FontItalicIcon />} />
        </ButtonTabsList>
      </ButtonTabs>,
    );

    expect(container.innerHTML).toMatchSnapshot("item-icon-only");
  });

  it("captures text+icon item snapshot", () => {
    const { container } = render(
      <ButtonTabs defaultValue="underline">
        <ButtonTabsList>
          <ButtonTabsItem value="underline" icon={<UnderlineIcon />}>
            Underline
          </ButtonTabsItem>
          <ButtonTabsItem value="add" icon={<PlusIcon />}>
            Add
          </ButtonTabsItem>
        </ButtonTabsList>
      </ButtonTabs>,
    );

    expect(container.innerHTML).toMatchSnapshot("item-text-icon");
  });
});
