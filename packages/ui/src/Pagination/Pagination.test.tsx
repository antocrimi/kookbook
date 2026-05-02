import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination } from "./index";

describe("Pagination", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders current page and navigation controls", () => {
    render(<Pagination totalPages={10} defaultPage={5} />);

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 5" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("fires onPageChange when clicking another page", () => {
    const onPageChange = vi.fn();

    render(<Pagination totalPages={10} defaultPage={3} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Go to page 4" }));

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("fires onPageChange through next and previous controls", () => {
    const onPageChange = vi.fn();

    render(<Pagination totalPages={10} defaultPage={2} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
    fireEvent.click(screen.getByRole("button", { name: "Go to previous page" }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2);
  });

  it("supports keyboard arrow navigation", async () => {
    const onPageChange = vi.fn();

    render(<Pagination totalPages={10} defaultPage={3} onPageChange={onPageChange} />);

    const page3Button = screen.getByRole("button", { name: "Go to page 3" });
    page3Button.focus();

    fireEvent.keyDown(page3Button, { key: "ArrowRight" });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Go to page 4" })).toHaveFocus();
    });

    fireEvent.keyDown(screen.getByRole("button", { name: "Go to page 4" }), {
      key: "ArrowLeft",
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Go to page 3" })).toHaveFocus();
    });

    expect(onPageChange).toHaveBeenNthCalledWith(1, 4);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });

  it("does not fire onPageChange when disabled", () => {
    const onPageChange = vi.fn();

    render(
      <Pagination totalPages={10} defaultPage={5} disabled onPageChange={onPageChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Go to page 6" }));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("captures basic pagination snapshot", () => {
    const { container } = render(<Pagination totalPages={5} defaultPage={3} />);

    expect(container.innerHTML).toMatchSnapshot("basic");
  });

  it("captures ellipsis pagination snapshot", () => {
    const { container } = render(
      <Pagination totalPages={12} defaultPage={6} siblingCount={1} boundaryCount={1} />,
    );

    expect(container.innerHTML).toMatchSnapshot("ellipsis");
  });

  it("captures disabled pagination snapshot", () => {
    const { container } = render(<Pagination totalPages={7} defaultPage={4} disabled />);

    expect(container.innerHTML).toMatchSnapshot("disabled");
  });
});
