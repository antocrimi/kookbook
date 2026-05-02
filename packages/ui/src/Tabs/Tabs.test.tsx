import { FontBoldIcon, FontItalicIcon, UnderlineIcon } from "@radix-ui/react-icons";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Tabs, TabsContent, TabsItem, TabsList } from "./index";

describe("Tabs", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders text-only, icon-only, and text+icon tab items", () => {
    render(
      <Tabs defaultValue="formatting" aria-label="Tabs demo">
        <TabsList>
          <TabsItem value="formatting">Formatting</TabsItem>
          <TabsItem value="italic" aria-label="Italic" icon={<FontItalicIcon />} />
          <TabsItem value="underline" icon={<UnderlineIcon />}>
            Underline
          </TabsItem>
        </TabsList>
      </Tabs>,
    );

    expect(screen.getByRole("tab", { name: "Formatting" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Italic" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Underline" })).toBeInTheDocument();
  });

  it("emits onValueChange when the selected tab changes", () => {
    const onValueChange = vi.fn();

    render(
      <Tabs defaultValue="formatting" onValueChange={onValueChange}>
        <TabsList>
          <TabsItem value="formatting">Formatting</TabsItem>
          <TabsItem value="preview">Preview</TabsItem>
        </TabsList>
        <TabsContent value="formatting">Formatting content</TabsContent>
        <TabsContent value="preview">Preview content</TabsContent>
      </Tabs>,
    );

    const previewTab = screen.getByRole("tab", { name: "Preview" });

    fireEvent.mouseDown(previewTab, { button: 0, ctrlKey: false });

    expect(onValueChange).toHaveBeenCalledWith("preview");
  });

  it("renders active tab content", () => {
    render(
      <Tabs defaultValue="formatting">
        <TabsList>
          <TabsItem value="formatting">Formatting</TabsItem>
          <TabsItem value="preview">Preview</TabsItem>
        </TabsList>
        <TabsContent value="formatting">Formatting content</TabsContent>
        <TabsContent value="preview">Preview content</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Formatting content")).toBeVisible();
    expect(screen.queryByText("Preview content")).not.toBeInTheDocument();
  });

  it("captures text-only item snapshot", () => {
    const { container } = render(
      <Tabs defaultValue="formatting">
        <TabsList>
          <TabsItem value="formatting">Formatting</TabsItem>
          <TabsItem value="preview">Preview</TabsItem>
        </TabsList>
      </Tabs>,
    );

    expect(container.innerHTML).toMatchSnapshot("item-text-only");
  });

  it("captures icon-only item snapshot", () => {
    const { container } = render(
      <Tabs defaultValue="italic">
        <TabsList>
          <TabsItem value="bold" aria-label="Bold" icon={<FontBoldIcon />} />
          <TabsItem value="italic" aria-label="Italic" icon={<FontItalicIcon />} />
        </TabsList>
      </Tabs>,
    );

    expect(container.innerHTML).toMatchSnapshot("item-icon-only");
  });

  it("captures text+icon item snapshot", () => {
    const { container } = render(
      <Tabs defaultValue="underline">
        <TabsList>
          <TabsItem value="underline" icon={<UnderlineIcon />}>
            Underline
          </TabsItem>
          <TabsItem value="preview" icon={<FontItalicIcon />}>
            Preview
          </TabsItem>
        </TabsList>
      </Tabs>,
    );

    expect(container.innerHTML).toMatchSnapshot("item-text-icon");
  });
});
