import { render, screen } from "@testing-library/react";
import { describe, expect, it, test } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { ProgressIndicator } from "./index";

describe("ProgressIndicator", () => {
  it("renders linear progress by default", () => {
    render(<ProgressIndicator value={60} aria-label="Loading" />);

    const progress = screen.getByRole("progressbar", { name: "Loading" });
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute("data-state", "loading");
    expect(progress).toHaveAttribute("aria-valuenow", "60");
  });

  it("renders an indeterminate state when value is undefined", () => {
    render(<ProgressIndicator aria-label="Pending" />);

    const progress = screen.getByRole("progressbar", { name: "Pending" });
    expect(progress).toHaveAttribute("data-state", "indeterminate");
    expect(progress).not.toHaveAttribute("aria-valuenow");
  });

  it("renders a circle variant", () => {
    const { container } = render(
      <ProgressIndicator variant="circle" value={40} fixedSize={96} aria-label="Sync progress" />,
    );

    expect(screen.getByRole("progressbar", { name: "Sync progress" })).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  test.each([
    ["linear-default", () => <ProgressIndicator value={35} aria-label="Linear default" />],
    ["linear-full-width", () => <ProgressIndicator value={35} size="fullWidth" aria-label="Linear full width" />],
    ["linear-indeterminate", () => <ProgressIndicator aria-label="Linear indeterminate" />],
    ["circle", () => <ProgressIndicator variant="circle" value={72} fixedSize={96} aria-label="Circle" />],
    ["circle-indeterminate", () => <ProgressIndicator variant="circle" fixedSize={96} aria-label="Circle indeterminate" />],
  ] as const)("captures %s rendering", (state, createElement) => {
    const { container } = render(createElement());

    expectSnapshotWithWarning(container.innerHTML, state);
  });
});
