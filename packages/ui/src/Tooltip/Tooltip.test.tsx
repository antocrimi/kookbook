import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, test } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./index";

const TooltipFixture = ({
  side = "top",
  disabled,
}: {
  side?: "top" | "right" | "bottom" | "left";
  disabled?: boolean;
}) => (
  <TooltipProvider>
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <button type="button" disabled={disabled}>
          Trigger
        </button>
      </TooltipTrigger>
      <TooltipContent side={side}>Tooltip content</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

describe("Tooltip", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders tooltip content when open", () => {
    render(<TooltipFixture />);

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  test.each(["top", "right", "bottom", "left"] as const)(
    "captures %s side rendering",
    (side) => {
      render(<TooltipFixture side={side} />);

      expectSnapshotWithWarning(document.body.innerHTML, `side-${side}`);
    },
  );

  it("captures disabled trigger rendering", () => {
    render(<TooltipFixture disabled />);

    expectSnapshotWithWarning(document.body.innerHTML, "disabled-trigger");
  });
});
