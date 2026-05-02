import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, test, vi } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { Banner, type BannerVariant } from "./index";

const BannerFixture = ({
  variant = "info",
  onOpenChange,
  dismissible = true,
}: {
  variant?: BannerVariant;
  onOpenChange?: (open: boolean) => void;
  dismissible?: boolean;
}) => (
  <Banner
    variant={variant}
    onOpenChange={onOpenChange}
    dismissible={dismissible}
    heading="This is the notification title which states the issue or topic."
    body="This is supporting text that instructs the user how to resolve the error that has occured or addresses the topic."
  />
);

describe("Banner", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders title and description", () => {
    render(<BannerFixture />);

    expect(
      screen.getByText("This is the notification title which states the issue or topic."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is supporting text that instructs the user how to resolve the error that has occured or addresses the topic.",
      ),
    ).toBeInTheDocument();
  });

  it("is dismissible", () => {
    const onOpenChange = vi.fn();

    render(<BannerFixture onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(
      screen.queryByText("This is the notification title which states the issue or topic."),
    ).not.toBeInTheDocument();
  });

  it("can be configured to be non-dismissible", () => {
    render(<BannerFixture dismissible={false} />);

    expect(
      screen.queryByRole("button", { name: "Dismiss notification" }),
    ).not.toBeInTheDocument();
  });

  test.each(["error", "warning", "info", "success"] as const)(
    "captures %s variant rendering",
    (variant) => {
      render(<BannerFixture variant={variant} />);

      expectSnapshotWithWarning(document.body.innerHTML, `variant-${variant}`);
    },
  );
});
