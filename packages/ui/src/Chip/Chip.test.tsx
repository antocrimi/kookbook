import { HeartFilledIcon } from "@radix-ui/react-icons";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, test, vi } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { Chip } from "./index";

describe("Chip", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders label and optional icon", () => {
    render(
      <Chip icon={<HeartFilledIcon aria-hidden />}>Item</Chip>,
    );

    expect(screen.getByText("Item")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove chip" })).toBeInTheDocument();
  });

  it("dismisses when remove icon is clicked", () => {
    const onOpenChange = vi.fn();
    const onRemove = vi.fn();

    render(
      <Chip onOpenChange={onOpenChange} onRemove={onRemove}>Item</Chip>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove chip" }));

    expect(screen.queryByText("Item")).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  test.each(["ghost", "outline"] as const)("captures %s variant rendering", (variant) => {
    const { container } = render(
      <Chip variant={variant} icon={<HeartFilledIcon aria-hidden />}>Item</Chip>,
    );

    expectSnapshotWithWarning(container.innerHTML, `variant-${variant}`);
  });

  it("renders without remove icon when removable is false", () => {
    const { container } = render(
      <Chip removable={false}>Item</Chip>,
    );

    expect(screen.queryByRole("button", { name: "Remove chip" })).not.toBeInTheDocument();
    expectSnapshotWithWarning(container.innerHTML, "non-removable");
  });
});
