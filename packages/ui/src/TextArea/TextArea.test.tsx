import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, test } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { TextArea } from "./index";

describe("TextArea", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with a label", () => {
    render(<TextArea label="Description" placeholder="Input text" />);

    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("does not set error state unless error prop is true", () => {
    const { rerender } = render(
      <TextArea label="Label" messageType="error" message="Validation error" />,
    );

    expect(screen.getByLabelText("Label")).not.toHaveAttribute("aria-invalid", "true");

    rerender(<TextArea label="Label" error messageType="error" message="Validation error" />);

    expect(screen.getByLabelText("Label")).toHaveAttribute("aria-invalid", "true");
  });

  test.each(["solid", "outline"] as const)("captures %s variant rendering", (variant) => {
    const { container } = render(
      <TextArea label="Label" placeholder="Input text" variant={variant} defaultValue="Input text" />,
    );

    expectSnapshotWithWarning(container.innerHTML, `variant-${variant}`);
  });

  test.each([
    ["fixed", undefined],
    ["fixed", "420px"],
    ["full", undefined],
  ] as const)("captures %s size rendering", (size, fixedWidth) => {
    const { container } = render(
      <TextArea
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
      <TextArea
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
      <TextArea label="Label" placeholder="Input text" defaultValue="Input text" disabled />,
    );

    expectSnapshotWithWarning(container.innerHTML, "disabled");
  });
});
