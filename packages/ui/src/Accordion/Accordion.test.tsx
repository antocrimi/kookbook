import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, test } from "vitest";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./index";

describe("Accordion", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders all trigger labels", () => {
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is Immergine?</AccordionTrigger>
          <AccordionContent>Immergine is a creator ecosystem.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How do I start?</AccordionTrigger>
          <AccordionContent>Start by creating your first project.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.getByRole("button", { name: "What is Immergine?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "How do I start?" })).toBeInTheDocument();
  });

  it("opens and closes content in single mode", () => {
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item one</AccordionTrigger>
          <AccordionContent>Content one</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item two</AccordionTrigger>
          <AccordionContent>Content two</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.getByText("Content one")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Item two" }));

    expect(screen.queryByText("Content one")).not.toBeInTheDocument();
    expect(screen.getByText("Content two")).toBeVisible();
  });

  it("supports multiple open items", () => {
    render(
      <Accordion type="multiple" defaultValue={["item-1"]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item one</AccordionTrigger>
          <AccordionContent>Content one</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item two</AccordionTrigger>
          <AccordionContent>Content two</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Item two" }));

    expect(screen.getByText("Content one")).toBeVisible();
    expect(screen.getByText("Content two")).toBeVisible();
  });

  it("uses fixed width by default and accepts custom fixed width", () => {
    const { rerender } = render(
      <Accordion type="single" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item one</AccordionTrigger>
          <AccordionContent>Content one</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const root = document.querySelector(`[data-orientation="vertical"]`);
    expect(root).toHaveStyle({ "--accordion-fixed-width": "360px" });

    rerender(
      <Accordion type="single" defaultValue="item-1" fixedWidth="420px">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item one</AccordionTrigger>
          <AccordionContent>Content one</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(root).toHaveStyle({ "--accordion-fixed-width": "420px" });
  });

  test.each([
    ["theme-dark-fixed", "theme-1", { width: "fixed" as const, fixedWidth: "420px" }],
    ["theme-dark-full-width", "theme-1", { width: "fullWidth" as const }],
    ["theme-light-fixed", "theme-2", { width: "fixed" as const }],
    ["theme-light-full-width", "theme-2", { width: "fullWidth" as const }],
  ])("captures %s snapshot", (snapshotName, themeName, widthProps) => {
    const { container } = render(
      <div data-theme={themeName}>
        <Accordion type="single" collapsible defaultValue="item-1" {...widthProps}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Accordion item one</AccordionTrigger>
            <AccordionContent>Accordion content one</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Accordion item two</AccordionTrigger>
            <AccordionContent>Accordion content two</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>,
    );

    expect(container.innerHTML).toMatchSnapshot(snapshotName);
  });
});
