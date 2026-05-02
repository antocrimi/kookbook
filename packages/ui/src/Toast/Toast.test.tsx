import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, test, vi } from "vitest";
import { expectSnapshotWithWarning } from "../test/snapshotWarning";
import { Toast, ToastProvider, ToastViewport, type ToastVariant } from "./index";

const ToastFixture = ({
  variant = "info",
  defaultOpen = true,
  onOpenChange,
}: {
  variant?: ToastVariant;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => (
  <ToastProvider>
    <Toast
      variant={variant}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      heading="This is the notification title which states the issue or topic."
      body="This is supporting text that gives the user more content that supports the notification."
    />
    <ToastViewport />
  </ToastProvider>
);

describe("Toast", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders title and description", () => {
    render(<ToastFixture />);

    expect(
      screen.getByText("This is the notification title which states the issue or topic."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is supporting text that gives the user more content that supports the notification.",
      ),
    ).toBeInTheDocument();
  });

  it("is dismissible", () => {
    const onOpenChange = vi.fn();
    render(<ToastFixture onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test.each(["error", "warning", "info", "success"] as const)(
    "captures %s variant rendering",
    (variant) => {
      render(<ToastFixture variant={variant} />);

      expectSnapshotWithWarning(document.body.innerHTML, `variant-${variant}`);
    },
  );

  it("keeps toast open when persistent is true", () => {
    const onOpenChange = vi.fn();

    render(
      <ToastProvider>
        <Toast
          persistent
          defaultOpen
          onOpenChange={onOpenChange}
          heading="Persistent"
          body="Should stay open until dismissed"
        />
        <ToastViewport />
      </ToastProvider>,
    );

    expect(screen.getByText("Persistent")).toBeInTheDocument();
  });
});
