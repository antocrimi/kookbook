import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";
import { describe, expect, it, test, vi } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { Slider } from "./index";

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
    value: vi.fn(),
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
});

describe("Slider", () => {
  it("renders with a single thumb", () => {
    render(<Slider aria-label="Volume" defaultValue={[40]} />);

    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuenow", "40");
  });

  it("invokes value change handler", () => {
    const onValueChange = vi.fn();

    render(<Slider aria-label="Volume" defaultValue={[40]} onValueChange={onValueChange} />);

    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });

    expect(onValueChange).toHaveBeenCalled();
  });

  it("shows pressed value tooltip", () => {
    render(<Slider aria-label="Opacity" value={[64]} />);

    const thumb = screen.getByRole("slider");
    fireEvent.pointerDown(thumb);

    expect(screen.getAllByText("64")[0]).toBeInTheDocument();
  });

  test.each([
    ["default", () => <Slider aria-label="Default slider" defaultValue={[55]} />],
    ["disabled", () => <Slider aria-label="Disabled slider" defaultValue={[45]} disabled />],
    ["range", () => <Slider aria-label="Range slider" defaultValue={[20, 80]} />],
    ["fixed-custom-width", () => <Slider aria-label="Fixed width slider" defaultValue={[50]} fixedWidth={480} />],
    ["full-width", () => <Slider aria-label="Full width slider" defaultValue={[50]} widthMode="fullWidth" />],
  ] as const)("captures %s rendering", (state, createElement) => {
    const { container } = render(createElement());

    expectSnapshotWithWarning(container.innerHTML, state);
  });
});
