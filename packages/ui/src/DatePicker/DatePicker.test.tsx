import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, test, vi } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { DatePicker } from "./index";

describe("DatePicker", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders input with label and default placeholder", () => {
    render(<DatePicker id="dp" label="Event date" />);
    expect(screen.getByText("Event date")).toBeInTheDocument();
    const input = document.getElementById("dp") as HTMLInputElement;
    expect(input.placeholder).toBe("mm/dd/yyyy");
  });

  it("formats defaultValue using dateFormat", () => {
    render(<DatePicker id="dp" defaultValue="2026-04-14" dateFormat="dd/mm/yyyy" />);
    const input = document.getElementById("dp") as HTMLInputElement;
    expect(input.value).toBe("14/04/2026");
  });

  it("uses dateFormat as placeholder when placeholder not provided", () => {
    render(<DatePicker id="dp" dateFormat="yyyy/mm/dd" />);
    const input = document.getElementById("dp") as HTMLInputElement;
    expect(input.placeholder).toBe("yyyy/mm/dd");
  });

  it("parses typed input and fires onValueChange with ISO", () => {
    const onValueChange = vi.fn();
    render(<DatePicker id="dp" onValueChange={onValueChange} />);
    const input = document.getElementById("dp") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "04/14/2026" } });
    expect(onValueChange).toHaveBeenCalledWith("2026-04-14");
  });

  it("ignores invalid typed input but still shows the text", () => {
    const onValueChange = vi.fn();
    render(<DatePicker id="dp" onValueChange={onValueChange} />);
    const input = document.getElementById("dp") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "13/45/2026" } });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input.value).toBe("13/45/2026");
  });

  it("emits hidden input with ISO when name is set", () => {
    const { container } = render(
      <DatePicker id="dp" name="event_date" defaultValue="2026-04-14" />,
    );
    const hidden = container.querySelector<HTMLInputElement>('input[name="event_date"]');
    expect(hidden?.value).toBe("2026-04-14");
  });

  it("clear button resets value and fires onValueChange(null)", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker id="dp" defaultValue="2026-04-14" onValueChange={onValueChange} />,
    );
    fireEvent.click(screen.getByLabelText("Clear date"));
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("selecting a day in the calendar fires onValueChange with ISO", () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker id="dp" defaultValue="2026-04-14" onValueChange={onValueChange} />,
    );
    fireEvent.click(screen.getByLabelText("Open calendar"));
    const days = screen.getAllByRole("gridcell");
    const target = days.find((cell) => cell.textContent?.trim() === "15");
    expect(target).toBeDefined();
    fireEvent.click(target!.querySelector("button") ?? target!);
    expect(onValueChange).toHaveBeenCalled();
    const arg = onValueChange.mock.calls.at(-1)?.[0];
    expect(arg).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("applies disabled and error state", () => {
    render(
      <DatePicker id="dp" label="Event date" disabled error message="Required" messageType="error" />,
    );
    const input = document.getElementById("dp") as HTMLInputElement;
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  test.each([
    ["variant-outline", () => <DatePicker label="Outline" defaultValue="2026-04-14" variant="outline" />],
    ["variant-solid", () => <DatePicker label="Solid" defaultValue="2026-04-14" variant="solid" />],
    ["variant-ghost", () => <DatePicker label="Ghost" defaultValue="2026-04-14" variant="ghost" />],
    ["error", () => <DatePicker label="Error" error message="Required" messageType="error" />],
    ["warning", () => <DatePicker label="Warning" message="Heads up" messageType="warning" />],
    ["info", () => <DatePicker label="Info" message="Extra context" messageType="info" />],
    ["disabled", () => <DatePicker label="Disabled" defaultValue="2026-04-14" disabled />],
    ["size-full", () => <DatePicker label="Full" size="full" />],
    ["size-fixed-custom", () => <DatePicker label="Fixed" size="fixed" fixedWidth={420} />],
    ["format-ddmmyyyy", () => <DatePicker label="DMY" defaultValue="2026-04-14" dateFormat="dd/mm/yyyy" />],
  ] as const)("captures %s rendering", (state, createElement) => {
    const { container } = render(createElement());
    expectSnapshotWithWarning(container.innerHTML, state);
  });
});
