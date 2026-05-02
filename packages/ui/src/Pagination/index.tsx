"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "../Button/index";
import styles from "./index.module.scss";

type PaginationItem = number | "ellipsis";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getPaginationItems = (
  totalPages: number,
  page: number,
  siblingCount: number,
  boundaryCount: number,
): PaginationItem[] => {
  if (totalPages <= 0) {
    return [];
  }

  const startPages = Array.from(
    { length: Math.min(boundaryCount, totalPages) },
    (_, index) => index + 1,
  );
  const endPages = Array.from(
    { length: Math.min(boundaryCount, totalPages) },
    (_, index) => totalPages - Math.min(boundaryCount, totalPages) + 1 + index,
  );

  const siblingsStart = Math.max(
    Math.min(
      page - siblingCount,
      totalPages - boundaryCount - siblingCount * 2 - 1,
    ),
    boundaryCount + 2,
  );

  const siblingsEnd = Math.min(
    Math.max(
      page + siblingCount,
      boundaryCount + siblingCount * 2 + 2,
    ),
    totalPages - boundaryCount - 1,
  );

  const items: PaginationItem[] = [];

  items.push(...startPages);

  if (siblingsStart > boundaryCount + 2) {
    items.push("ellipsis");
  } else if (boundaryCount + 1 < totalPages - boundaryCount) {
    items.push(boundaryCount + 1);
  }

  for (let item = siblingsStart; item <= siblingsEnd; item += 1) {
    items.push(item);
  }

  if (siblingsEnd < totalPages - boundaryCount - 1) {
    items.push("ellipsis");
  } else if (totalPages - boundaryCount > boundaryCount) {
    items.push(totalPages - boundaryCount);
  }

  items.push(...endPages);

  return items;
};

interface PaginationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  iconOnly?: boolean;
  children: ReactNode;
}

const PaginationButton = ({
  className,
  active = false,
  iconOnly = false,
  children,
  ...props
}: PaginationButtonProps) => (
  <Button
    variant="ghost"
    size="md"
    iconOnly={iconOnly}
    className={cx(styles.button, active && styles.active, className)}
    aria-current={active ? "page" : undefined}
    {...props}
  >
    {children}
  </Button>
);

type PrimitivePaginationProps = Omit<ComponentPropsWithoutRef<"nav">, "onChange">;

export interface PaginationProps extends PrimitivePaginationProps {
  className?: string;
  totalPages: number;
  page?: number;
  defaultPage?: number;
  siblingCount?: number;
  boundaryCount?: number;
  disabled?: boolean;
  onPageChange?: (nextPage: number) => void;
}

export const Pagination = forwardRef<ElementRef<"nav">, PaginationProps>(
  (
    {
      className,
      totalPages,
      page,
      defaultPage = 1,
      siblingCount = 1,
      boundaryCount = 1,
      disabled = false,
      onPageChange,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledPage, setUncontrolledPage] = useState(defaultPage);
    const navRef = useRef<HTMLElement | null>(null);
    const maxPage = Math.max(1, totalPages);
    const resolvedPage = clamp(page ?? uncontrolledPage, 1, maxPage);

    const items = useMemo(
      () =>
        getPaginationItems(
          maxPage,
          resolvedPage,
          Math.max(0, siblingCount),
          Math.max(0, boundaryCount),
        ),
      [boundaryCount, maxPage, resolvedPage, siblingCount],
    );

    const setPage = (nextPage: number) => {
      const clampedPage = clamp(nextPage, 1, maxPage);
      if (clampedPage === resolvedPage || disabled) {
        return;
      }

      if (page === undefined) {
        setUncontrolledPage(clampedPage);
      }

      onPageChange?.(clampedPage);
    };

    const focusPageButton = (targetPage: number) => {
      requestAnimationFrame(() => {
        const target = navRef.current?.querySelector<HTMLButtonElement>(
          `button[data-page="${targetPage}"]`,
        );
        target?.focus();
      });
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      let nextPage: number | null = null;

      if (event.key === "ArrowRight") {
        nextPage = resolvedPage + 1;
      }

      if (event.key === "ArrowLeft") {
        nextPage = resolvedPage - 1;
      }

      if (nextPage === null) {
        return;
      }

      event.preventDefault();

      const clampedPage = clamp(nextPage, 1, maxPage);
      if (clampedPage === resolvedPage || disabled) {
        return;
      }

      setPage(clampedPage);
      focusPageButton(clampedPage);
    };

    const setRefs = (node: HTMLElement | null) => {
      navRef.current = node;

      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <nav
        ref={setRefs}
        className={cx(styles.root, className)}
        aria-label="Pagination"
        onKeyDown={handleKeyDown}
        {...props}
      >
        <PaginationButton
          aria-label="Go to previous page"
          onClick={() => setPage(resolvedPage - 1)}
          disabled={disabled || resolvedPage <= 1}
          iconOnly
        >
          <ChevronLeftIcon />
        </PaginationButton>

        {items.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index + 1}`}
                className={styles.ellipsis}
                aria-hidden
              >
                …
              </span>
            );
          }

          return (
            <PaginationButton
              key={item}
              active={item === resolvedPage}
              aria-label={`Go to page ${item}`}
              onClick={() => setPage(item)}
              disabled={disabled}
              data-page={item}
            >
              {item}
            </PaginationButton>
          );
        })}

        <PaginationButton
          aria-label="Go to next page"
          onClick={() => setPage(resolvedPage + 1)}
          disabled={disabled || resolvedPage >= maxPage}
          iconOnly
        >
          <ChevronRightIcon />
        </PaginationButton>
      </nav>
    );
  },
);

Pagination.displayName = "Pagination";
