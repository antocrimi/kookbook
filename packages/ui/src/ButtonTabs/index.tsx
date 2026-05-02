"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementRef,
  type ReactNode,
} from "react";
import styles from "./index.module.scss";

type PrimitiveButtonTabsProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;
type PrimitiveButtonTabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List>;
type PrimitiveButtonTabsItemProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;
type PrimitiveButtonTabsContentProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Content>;

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface ButtonTabsProps extends PrimitiveButtonTabsProps {
  className?: string;
}

export const ButtonTabs = forwardRef<ElementRef<typeof TabsPrimitive.Root>, ButtonTabsProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Root ref={ref} className={cx(styles.tabs, className)} {...props} />
  ),
);

ButtonTabs.displayName = "ButtonTabs";

export interface ButtonTabsListProps extends PrimitiveButtonTabsListProps {
  className?: string;
}

export const ButtonTabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ButtonTabsListProps
>(({ className, children, ...props }, ref) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [highlightStyle, setHighlightStyle] = useState<CSSProperties>({
    "--button-tabs-highlight-x": "0px",
    "--button-tabs-highlight-width": "0px",
    "--button-tabs-highlight-opacity": 0,
  } as CSSProperties);

  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    const updateHighlight = () => {
      const activeTab = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');

      if (!activeTab) {
        setHighlightStyle({
          "--button-tabs-highlight-x": "0px",
          "--button-tabs-highlight-width": "0px",
          "--button-tabs-highlight-opacity": 0,
        } as CSSProperties);

        return;
      }

      setHighlightStyle({
        "--button-tabs-highlight-x": `${activeTab.offsetLeft}px`,
        "--button-tabs-highlight-width": `${activeTab.offsetWidth}px`,
        "--button-tabs-highlight-opacity": 1,
      } as CSSProperties);
    };

    updateHighlight();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            updateHighlight();
          });

    resizeObserver?.observe(list);
    Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).forEach((tab) => {
      resizeObserver?.observe(tab);
    });

    const mutationObserver = new MutationObserver(() => {
      updateHighlight();
    });

    mutationObserver.observe(list, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state", "hidden", "style", "class"],
    });

    return () => {
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
    };
  }, [children]);

  const setRefs = (node: HTMLDivElement | null) => {
    listRef.current = node;

    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <TabsPrimitive.List
      ref={setRefs}
      className={cx(styles.list, className)}
      style={highlightStyle}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  );
});

ButtonTabsList.displayName = "ButtonTabsList";

export interface ButtonTabsItemProps extends Omit<PrimitiveButtonTabsItemProps, "children"> {
  className?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export const ButtonTabsItem = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ButtonTabsItemProps
>(({ className, icon, children, ...props }, ref) => (
  <TabsPrimitive.Trigger ref={ref} className={cx(styles.item, className)} {...props}>
    {icon ? <span className={styles.icon}>{icon}</span> : null}
    {children ? <span className={styles.label}>{children}</span> : null}
  </TabsPrimitive.Trigger>
));

ButtonTabsItem.displayName = "ButtonTabsItem";

export interface ButtonTabsContentProps extends PrimitiveButtonTabsContentProps {
  className?: string;
}

export const ButtonTabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ButtonTabsContentProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cx(styles.content, className)} {...props} />
));

ButtonTabsContent.displayName = "ButtonTabsContent";
