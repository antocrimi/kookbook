import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, test, vi } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { Checkbox } from "./index";

describe("Checkbox", () => {
  it("renders an unchecked checkbox by default", () => {
    render(<Checkbox aria-label="Accept terms" />);

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });

  it("renders an attached label and toggles when label is clicked", () => {
    const onCheckedChange = vi.fn();

    render(<Checkbox label="Checkbox item" onCheckedChange={onCheckedChange} />);

    expect(screen.getByText("Checkbox item")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Checkbox item"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("invokes checked change handler", () => {
    const onCheckedChange = vi.fn();

    render(<Checkbox aria-label="Enable notifications" onCheckedChange={onCheckedChange} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Enable notifications" }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  test.each([
    ["unchecked", undefined],
    ["checked", true],
    ["indeterminate", "indeterminate"],
  ] as const)("captures %s state rendering", (state, checked) => {
    const { container } = render(<Checkbox id={`checkbox-state-${state}`} aria-label={`State ${state}`} checked={checked} />);

    expectSnapshotWithWarning(container.innerHTML, `state-${state}`);
  });

  test.each(["default", "critical"] as const)("captures %s tone rendering", (tone) => {
    const { container } = render(
      <Checkbox id={`checkbox-tone-${tone}`} tone={tone} aria-label={`Tone ${tone}`} checked />,
    );

    expectSnapshotWithWarning(container.innerHTML, `tone-${tone}`);
  });

  it("captures labeled rendering", () => {
    const { container } = render(<Checkbox id="checkbox-with-label" label="Checkbox item" checked />);

    expectSnapshotWithWarning(container.innerHTML, "with-label");
  });

  it("captures disabled rendering", () => {
    const { container } = render(
      <Checkbox id="checkbox-disabled" aria-label="Disabled checkbox" disabled checked />,
    );

    expectSnapshotWithWarning(container.innerHTML, "disabled");
  });
});
