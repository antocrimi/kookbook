import { CaretSortIcon } from "@radix-ui/react-icons";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, test } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { Select, SelectItem } from "./index";

describe("Select", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders trigger with label", () => {
    render(
      <Select label="Framework" defaultValue="react">
        <SelectItem value="react">React</SelectItem>
      </Select>,
    );

    expect(screen.getByText("Framework")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("updates selected value", () => {
    render(
      <Select label="Framework" placeholder="Select framework" defaultValue="react">
        <SelectItem value="react">React</SelectItem>
        <SelectItem value="vue">Vue</SelectItem>
      </Select>,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Vue" }));

    expect(screen.getByRole("combobox")).toHaveTextContent("Vue");
  });


  it("applies disabled and error state", () => {
    render(
      <Select label="Framework" defaultValue="react" disabled error message="Validation error" messageType="error">
        <SelectItem value="react">React</SelectItem>
      </Select>,
    );

    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("combobox")).toHaveAttribute("data-disabled", "");
  });

  test.each([
    ["variant-solid", () => (
      <Select label="Variant" defaultValue="react" variant="solid">
        <SelectItem value="react">React</SelectItem>
        <SelectItem value="vue">Vue</SelectItem>
      </Select>
    )],
    ["variant-outline", () => (
      <Select label="Variant" defaultValue="react" variant="outline">
        <SelectItem value="react">React</SelectItem>
        <SelectItem value="vue">Vue</SelectItem>
      </Select>
    )],
    ["variant-ghost", () => (
      <Select label="Variant" defaultValue="react" variant="ghost">
        <SelectItem value="react">React</SelectItem>
        <SelectItem value="vue">Vue</SelectItem>
      </Select>
    )],
    ["error", () => (
      <Select label="Error" defaultValue="react" error message="Validation error" messageType="error">
        <SelectItem value="react">React</SelectItem>
      </Select>
    )],
    ["warning", () => (
      <Select label="Warning" defaultValue="react" message="Choose carefully" messageType="warning">
        <SelectItem value="react">React</SelectItem>
      </Select>
    )],
    ["info", () => (
      <Select label="Info" defaultValue="react" message="Additional context" messageType="info">
        <SelectItem value="react">React</SelectItem>
      </Select>
    )],
    ["disabled", () => (
      <Select label="Disabled" defaultValue="react" disabled>
        <SelectItem value="react">React</SelectItem>
      </Select>
    )],
    ["size-full", () => (
      <Select label="Full" defaultValue="react" size="full">
        <SelectItem value="react">React</SelectItem>
      </Select>
    )],
    ["size-fixed-custom", () => (
      <Select label="Fixed" defaultValue="react" size="fixed" fixedWidth={420}>
        <SelectItem value="react">React</SelectItem>
      </Select>
    )],
  ] as const)("captures %s rendering", (state, createElement) => {
    const { container } = render(createElement());

    expectSnapshotWithWarning(container.innerHTML, state);
  });
  it("renders a custom trigger icon when provided", () => {
    render(
      <Select label="Framework" defaultValue="react" triggerIcon={<CaretSortIcon aria-hidden data-testid="custom-icon" />}>
        <SelectItem value="react">React</SelectItem>
      </Select>,
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

});
