import { render, screen } from "@testing-library/react";
import { describe, expect, it, test } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { Badge } from "./index";

describe("Badge", () => {
  it("renders text content", () => {
    render(<Badge>99+</Badge>);

    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  test.each(["standalone", "appended"] as const)(
    "captures %s variant rendering",
    (variant) => {
      const { container } = render(<Badge variant={variant}>New</Badge>);

      expectSnapshotWithWarning(container.innerHTML, `variant-${variant}`);
    },
  );

  it("captures empty rendering", () => {
    const { container } = render(<Badge />);

    expectSnapshotWithWarning(container.innerHTML, "empty");
  });

  it("captures custom class rendering", () => {
    const { container } = render(<Badge className="custom-badge">8</Badge>);

    expect(container.firstElementChild).toHaveClass("custom-badge");
    expectSnapshotWithWarning(container.innerHTML, "custom-class");
  });
});
