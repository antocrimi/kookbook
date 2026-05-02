import { FontBoldIcon, UnderlineIcon } from "@radix-ui/react-icons";
import { fireEvent, render, screen } from "@testing-library/react";
import { type ComponentProps, useState } from "react";
import { describe, expect, it, test, vi } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { Toggle } from "./index";

type ToggleTestProps = ComponentProps<typeof Toggle>;

const ControlledToggle = (props: ToggleTestProps) => {
  const [pressed, setPressed] = useState(false);

  return (
    <Toggle
      {...props}
      pressed={pressed}
      onPressedChange={(nextPressed) => {
        setPressed(nextPressed);
        props.onPressedChange?.(nextPressed);
      }}
    />
  );
};

describe("Toggle", () => {
  it("renders an unpressed toggle by default", () => {
    render(<Toggle aria-label="Bold" icon={<FontBoldIcon />} />);

    const toggle = screen.getByRole("button", { name: "Bold" });
    expect(toggle).toHaveAttribute("data-state", "off");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("emits pressed state changes", () => {
    const onPressedChange = vi.fn();

    render(
      <Toggle
        aria-label="Underline"
        icon={<UnderlineIcon />}
        onPressedChange={onPressedChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Underline" }));

    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("supports external pressed state through onPressedChange", () => {
    const onPressedChange = vi.fn();

    render(
      <ControlledToggle
        aria-label="Externally controlled"
        icon={<FontBoldIcon />}
        onPressedChange={onPressedChange}
      />,
    );

    const toggle = screen.getByRole("button", { name: "Externally controlled" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);

    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("supports icon and children together", () => {
    render(
      <Toggle aria-label="Format" icon={<FontBoldIcon />}>
        Bold
      </Toggle>,
    );

    expect(screen.getByRole("button", { name: "Format" })).toHaveTextContent("Bold");
  });

  test.each(["sm", "md", "lg"] as const)("captures %s size rendering", (size) => {
    const { container } = render(
      <Toggle aria-label={`Toggle ${size}`} size={size} icon={<FontBoldIcon />} />,
    );

    expectSnapshotWithWarning(container.innerHTML, `size-${size}`);
  });

  it("captures icon prop rendering", () => {
    const { container } = render(
      <Toggle aria-label="Icon only" icon={<UnderlineIcon />} />,
    );

    expectSnapshotWithWarning(container.innerHTML, "icon-prop");
  });

  it("captures pressed and disabled rendering", () => {
    const { container: pressedContainer } = render(
      <Toggle aria-label="Pressed" pressed icon={<FontBoldIcon />} />,
    );

    expectSnapshotWithWarning(pressedContainer.innerHTML, "pressed");

    const { container: disabledContainer } = render(
      <Toggle aria-label="Disabled" disabled icon={<FontBoldIcon />} />,
    );

    expectSnapshotWithWarning(disabledContainer.innerHTML, "disabled");
  });
});
