import { render, screen } from "@testing-library/react";
import { describe, expect, it, test } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { Logo } from "./index";

describe("Logo", () => {
  it("renders accessibly", () => {
    render(<Logo />);

    expect(screen.getByRole("img", { name: "Immergine logo" })).toBeInTheDocument();
  });

  test.each(["xs", "sm", "md", "lg", "xl"] as const)(
    "captures %s size rendering",
    (size) => {
      const { container } = render(<Logo size={size} />);

      expectSnapshotWithWarning(container.innerHTML, `size-${size}`);
    },
  );

  it("captures custom class rendering", () => {
    const { container } = render(<Logo className="custom-logo" />);

    expect(container.firstElementChild).toHaveClass("custom-logo");
    expectSnapshotWithWarning(container.innerHTML, "custom-class");
  });
});
