import { render, screen } from "@testing-library/react";
import { describe, expect, it, test } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { Tag } from "./index";

describe("Tag", () => {
  it("renders text content", () => {
    render(<Tag>Label</Tag>);

    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  test.each(["solid", "outline"] as const)("captures %s variant rendering", (variant) => {
    const { container } = render(<Tag variant={variant}>Variant {variant}</Tag>);

    expectSnapshotWithWarning(container.innerHTML, `variant-${variant}`);
  });

  it("captures custom class rendering", () => {
    const { container } = render(
      <Tag className="custom-tag">Custom class</Tag>,
    );

    expect(container.firstElementChild).toHaveClass("custom-tag");
    expectSnapshotWithWarning(container.innerHTML, "custom-class");
  });
});
