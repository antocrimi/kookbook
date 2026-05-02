import { render, screen } from "@testing-library/react";
import { describe, expect, it, test } from "vitest";
import { Button } from "./index";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";

describe("Button", () => {
  it("renders children and defaults to button type", () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
    expect(button).not.toBeDisabled();
  });

  it("becomes disabled and busy when loading", () => {
    render(<Button loading>Saving</Button>);

    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("data-loading", "true");
  });

  it("honors explicit disabled state", () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
  });

  test.each(["solid", "outline", "ghost"] as const)(
    "captures %s variant rendering",
    (variant) => {
      const { container } = render(
        <Button variant={variant}>Variant {variant}</Button>,
      );

      expectSnapshotWithWarning(container.innerHTML, `variant-${variant}`);
    },
  );

  test.each(["primary", "critical"] as const)("captures %s tone rendering", (tone) => {
    const { container } = render(<Button tone={tone}>Tone {tone}</Button>);

    expectSnapshotWithWarning(container.innerHTML, `tone-${tone}`);
  });

  test.each(["xs", "sm", "md", "lg"] as const)("captures %s size rendering", (size) => {
    const { container } = render(<Button size={size}>Size {size}</Button>);

    expectSnapshotWithWarning(container.innerHTML, `size-${size}`);
  });

  it("captures icon-only and full width renderings", () => {
    const { container: iconOnlyContainer } = render(
      <Button iconOnly aria-label="Add item">
        <span aria-hidden>+</span>
      </Button>,
    );

    expectSnapshotWithWarning(iconOnlyContainer.innerHTML, "icon-only");

    const { container: fullWidthContainer } = render(
      <Button fullWidth>Grow</Button>,
    );

    expectSnapshotWithWarning(fullWidthContainer.innerHTML, "full-width");
  });
});
