import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, test, vi } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { TextField } from "./index";

describe("TextField", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders with a label", () => {
    const { getByLabelText } = render(<TextField label="Name" placeholder="Input text" />);

    expect(getByLabelText("Name")).toBeInTheDocument();
  });

  it("shows clear action when value is entered", () => {
    render(<TextField label="Email" defaultValue="hello@example.com" />);

    expect(screen.getByRole("button", { name: "Clear input" })).toBeInTheDocument();
  });

  it("calls onClear when clear button is clicked", () => {
    const onClear = vi.fn();

    const { getByRole } = render(
      <TextField
        label="Search"
        defaultValue="topic"
        clearButtonLabel="Clear search input"
        onClear={onClear}
      />,
    );

    fireEvent.click(getByRole("button", { name: "Clear search input" }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });


  it("clears uncontrolled input value when clear button is clicked", () => {
    const { getByLabelText, getByRole } = render(
      <TextField label="Search" defaultValue="topic" clearButtonLabel="Clear search input" />,
    );

    const input = getByLabelText("Search") as HTMLInputElement;
    expect(input.value).toBe("topic");

    fireEvent.click(getByRole("button", { name: "Clear search input" }));

    expect(input.value).toBe("");
  });


  it("does not set error state unless error prop is true", () => {
    const { rerender } = render(<TextField label="Label" messageType="error" message="Validation error" />);

    expect(screen.getByLabelText("Label")).not.toHaveAttribute("aria-invalid", "true");

    rerender(<TextField label="Label" error messageType="error" message="Validation error" />);

    expect(screen.getByLabelText("Label")).toHaveAttribute("aria-invalid", "true");
  });

  test.each(["solid", "outline", "exposed"] as const)(
    "captures %s variant rendering",
    (variant) => {
      const { container } = render(
        <TextField label="Label" placeholder="Input text" variant={variant} defaultValue="Input text" />,
      );

      expectSnapshotWithWarning(container.innerHTML, `variant-${variant}`);
    },
  );


  test.each([
    ["fixed", undefined],
    ["fixed", "420px"],
    ["full", undefined],
  ] as const)("captures %s size rendering", (size, fixedWidth) => {
    const { container } = render(
      <TextField
        label="Label"
        placeholder="Input text"
        defaultValue="Input text"
        size={size}
        fixedWidth={fixedWidth}
      />,
    );

    expectSnapshotWithWarning(container.innerHTML, `size-${size}-${fixedWidth ?? "default"}`);
  });

  test.each([
    ["error", "Validation error"],
    ["warning", "Use strong password"],
    ["info", "Additional info"],
  ] as const)("captures %s message rendering", (messageType, message) => {
    const { container } = render(
      <TextField
        label="Label"
        defaultValue="Input text"
        error={messageType === "error"}
        messageType={messageType}
        message={message}
      />,
    );

    expectSnapshotWithWarning(container.innerHTML, `message-${messageType}`);
  });

  it("captures disabled rendering", () => {
    const { container } = render(
      <TextField label="Label" placeholder="Input text" defaultValue="Input text" disabled />,
    );

    expectSnapshotWithWarning(container.innerHTML, "disabled");
  });
});
