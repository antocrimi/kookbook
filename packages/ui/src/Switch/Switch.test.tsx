import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, test, vi } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { Switch } from "./index";

describe("Switch", () => {
  it("renders an unchecked switch by default", () => {
    render(<Switch aria-label="Enable notifications" />);

    const control = screen.getByRole("switch", { name: "Enable notifications" });
    expect(control).toBeInTheDocument();
    expect(control).toHaveAttribute("data-state", "unchecked");
    expect(control).toHaveAttribute("aria-checked", "false");
  });

  it("invokes checked change handler", () => {
    const onCheckedChange = vi.fn();

    render(<Switch aria-label="Realtime updates" onCheckedChange={onCheckedChange} />);

    fireEvent.click(screen.getByRole("switch", { name: "Realtime updates" }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  test.each([
    ["unchecked", false],
    ["checked", true],
  ] as const)("captures %s state rendering", (state, checked) => {
    const { container } = render(
      <Switch id={`switch-state-${state}`} aria-label={`State ${state}`} checked={checked} />,
    );

    expectSnapshotWithWarning(container.innerHTML, `state-${state}`);
  });

  it("captures disabled rendering", () => {
    const { container } = render(
      <Switch id="switch-disabled" aria-label="Disabled switch" disabled checked />,
    );

    expectSnapshotWithWarning(container.innerHTML, "disabled");
  });

  it("captures custom class rendering", () => {
    const { container } = render(
      <Switch aria-label="Custom class switch" className="switch-root" thumbClassName="switch-thumb" />,
    );

    expectSnapshotWithWarning(container.innerHTML, "custom-classes");
  });
});
