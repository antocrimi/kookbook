import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { Dialog, DialogAction, DialogActions, DialogContent, DialogTrigger } from "./index";

const DialogFixture = ({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) => (
  <Dialog defaultOpen onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <button type="button">Open dialog</button>
    </DialogTrigger>
    <DialogContent
      eyebrow="Eyebrow"
      heading="Title"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit aliquam, purus sit amet luctus venenatis."
    >
      <div>Custom slot content</div>
      <DialogActions>
        <DialogAction>Cancel</DialogAction>
        <DialogAction variant="primary">Confirm</DialogAction>
      </DialogActions>
    </DialogContent>
  </Dialog>
);

describe("Dialog", () => {
  afterEach(() => {
    cleanup();
    document.body.removeAttribute("data-theme");
  });

  it("renders title, eyebrow, description, and custom content", () => {
    render(<DialogFixture />);

    expect(screen.getByText("Eyebrow")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Custom slot content")).toBeInTheDocument();
  });

  it("renders a dismissible backdrop", () => {
    render(<DialogFixture />);

    expect(document.querySelector('[class*="overlay"]')).toBeInTheDocument();
  });

  it("dismisses via close icon", () => {
    const onOpenChange = vi.fn();

    render(<DialogFixture onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("dismisses via action click", () => {
    const onOpenChange = vi.fn();

    render(<DialogFixture onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("captures light and dark theme snapshots", () => {
    document.body.setAttribute("data-theme", "theme-1");
    render(<DialogFixture />);
    expectSnapshotWithWarning(document.body.innerHTML, "theme-1");

    cleanup();

    document.body.setAttribute("data-theme", "theme-2");
    render(<DialogFixture />);
    expectSnapshotWithWarning(document.body.innerHTML, "theme-2");
  });
});
