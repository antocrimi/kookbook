import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, test, vi } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { RadioSelector, RadioSelectorItem } from "./index";

describe("RadioSelector", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders and updates selection", () => {
    render(
      <RadioSelector defaultValue="option-1" aria-label="Plan selector">
        <RadioSelectorItem value="option-1" label="Basic" />
        <RadioSelectorItem value="option-2" label="Pro" />
      </RadioSelector>,
    );

    const proOption = screen.getByRole("radio", { name: "Pro" });

    fireEvent.click(proOption);

    expect(proOption).toHaveAttribute("data-state", "checked");
  });

  it("does not trigger value change for disabled item", () => {
    const onValueChange = vi.fn();

    render(
      <RadioSelector defaultValue="option-1" onValueChange={onValueChange} aria-label="Plan selector">
        <RadioSelectorItem value="option-1" label="Basic" />
        <RadioSelectorItem value="option-2" label="Pro" disabled />
      </RadioSelector>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Pro" }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("applies error state on root", () => {
    render(
      <RadioSelector defaultValue="option-1" aria-label="Error selector" error>
        <RadioSelectorItem value="option-1" label="Primary" />
      </RadioSelector>,
    );

    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true");
  });

  test.each([
    ["default", () => (
      <RadioSelector defaultValue="option-1" aria-label="Default selector">
        <RadioSelectorItem value="option-1" label="Option 1" />
        <RadioSelectorItem value="option-2" label="Option 2" />
      </RadioSelector>
    )],
    ["disabled", () => (
      <RadioSelector defaultValue="option-1" aria-label="Disabled selector">
        <RadioSelectorItem value="option-1" label="Option 1" />
        <RadioSelectorItem value="option-2" label="Option 2" disabled />
      </RadioSelector>
    )],
    ["error", () => (
      <RadioSelector defaultValue="option-1" aria-label="Error selector" error>
        <RadioSelectorItem value="option-1" label="Option 1" error message="Invalid" messageType="error" />
        <RadioSelectorItem value="option-2" label="Option 2" />
      </RadioSelector>
    )],
    ["message-warning", () => (
      <RadioSelector defaultValue="option-1" aria-label="Warning selector">
        <RadioSelectorItem value="option-1" label="Option 1" message="Check this" messageType="warning" />
        <RadioSelectorItem value="option-2" label="Option 2" />
      </RadioSelector>
    )],
    ["message-info", () => (
      <RadioSelector defaultValue="option-1" aria-label="Info selector">
        <RadioSelectorItem value="option-1" label="Option 1" message="FYI" messageType="info" />
        <RadioSelectorItem value="option-2" label="Option 2" />
      </RadioSelector>
    )],
  ] as const)("captures %s rendering", (state, createElement) => {
    const { container } = render(createElement());

    expectSnapshotWithWarning(container.innerHTML, state);
  });
});
