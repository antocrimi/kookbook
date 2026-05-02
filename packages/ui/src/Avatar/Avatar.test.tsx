import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, test, vi } from "vitest";
import { Avatar } from "./index";

describe("Avatar", () => {
  const OriginalImage = window.Image;

  beforeEach(() => {
    class MockImage {
      onload: null | (() => void) = null;

      onerror: null | (() => void) = null;

      private listeners: Record<string, Array<() => void>> = {};

      addEventListener(event: string, callback: () => void) {
        this.listeners[event] = [...(this.listeners[event] ?? []), callback];
      }

      removeEventListener(event: string, callback: () => void) {
        this.listeners[event] = (this.listeners[event] ?? []).filter((fn) => fn !== callback);
      }

      private emit(event: "load" | "error") {
        this.listeners[event]?.forEach((callback) => callback());
        if (event === "load") {
          this.onload?.();
          return;
        }

        this.onerror?.();
      }

      set src(value: string) {
        if (!value) {
          queueMicrotask(() => this.emit("error"));
          return;
        }

        queueMicrotask(() => this.emit("load"));
      }
    }

    // @ts-expect-error test mock for image loading behavior
    window.Image = MockImage;
  });

  afterEach(() => {
    cleanup();
    window.Image = OriginalImage;
    vi.restoreAllMocks();
  });

  it("renders an image by default", async () => {
    render(<Avatar src="/avatar.png" name="John Doe" />);

    await waitFor(() => {
      const image = screen.getByRole("img", { name: "John Doe" });
      expect(image).toHaveAttribute("src", "/avatar.png");
    });
  });

  it("renders fallback initials when image source is not provided", async () => {
    render(<Avatar name="Ada Lovelace" src={undefined} />);

    await waitFor(() => {
      expect(screen.getByText("AL")).toBeInTheDocument();
    });
  });

  test.each(["sm", "md", "lg"] as const)("captures %s size rendering", async (size) => {
    const { container } = render(<Avatar name="Snapshot User" src={undefined} size={size} />);

    await waitFor(() => {
      expect(screen.getByText("SU")).toBeInTheDocument();
    });

    expect(container.innerHTML).toMatchSnapshot(`size-${size}`);
  });

  it("captures default circle rendering", async () => {
    const { container } = render(<Avatar name="Shape Snapshot" src={undefined} />);

    await waitFor(() => {
      expect(screen.getByText("SS")).toBeInTheDocument();
    });

    expect(container.innerHTML).toMatchSnapshot("shape-circle");
  });

  it("captures custom fallback rendering", async () => {
    const { container } = render(<Avatar src={undefined} fallback="JD" />);

    await waitFor(() => {
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    expect(container.innerHTML).toMatchSnapshot("fallback-custom");
  });
});
