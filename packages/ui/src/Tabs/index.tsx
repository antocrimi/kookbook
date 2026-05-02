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

type PrimitiveTabsProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;

type PrimitiveTabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List>;

type PrimitiveTabsItemProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;

type PrimitiveTabsContentProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Content>;

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface TabsProps extends PrimitiveTabsProps {
  className?: string;
}

export const Tabs = forwardRef<ElementRef<typeof TabsPrimitive.Root>, TabsProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Root ref={ref} className={cx(styles.tabs, className)} {...props} />
  ),
);

Tabs.displayName = "Tabs";

export interface TabsListProps extends PrimitiveTabsListProps {
  className?: string;
}

export const TabsList = forwardRef<ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    const listRef = useRef<HTMLDivElement | null>(null);
    const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({
      transform: "translateX(0px)",
      width: "0px",
      opacity: 0,
    });

    useIsomorphicLayoutEffect(() => {
      const list = listRef.current;
      if (!list) {
        return;
      }

      const updateIndicator = () => {
        const activeTab = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');

        if (!activeTab) {
          setIndicatorStyle({
            transform: "translateX(0px)",
            width: "0px",
            opacity: 0,
          });
          return;
        }

        setIndicatorStyle({
          transform: `translateX(${activeTab.offsetLeft}px)`,
          width: `${activeTab.offsetWidth}px`,
          opacity: 1,
        });
      };

      updateIndicator();

      const resizeObserver =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(() => {
              updateIndicator();
            });

      resizeObserver?.observe(list);
      Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).forEach((tab) => {
        resizeObserver?.observe(tab);
      });

      const mutationObserver = new MutationObserver(() => {
        updateIndicator();
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
      <TabsPrimitive.List ref={setRefs} className={cx(styles.list, className)} {...props}>
        {children}
        <div aria-hidden className={styles.indicator} style={indicatorStyle} />
      </TabsPrimitive.List>
    );
  },
);

TabsList.displayName = "TabsList";

export interface TabsItemProps extends Omit<PrimitiveTabsItemProps, "children"> {
  className?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export const TabsItem = forwardRef<ElementRef<typeof TabsPrimitive.Trigger>, TabsItemProps>(
  ({ className, icon, children, ...props }, ref) => (
    <TabsPrimitive.Trigger ref={ref} className={cx(styles.item, className)} {...props}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {children ? <span className={styles.label}>{children}</span> : null}
    </TabsPrimitive.Trigger>
  ),
);

TabsItem.displayName = "TabsItem";

export interface TabsContentProps extends PrimitiveTabsContentProps {
  className?: string;
}

export const TabsContent = forwardRef<ElementRef<typeof TabsPrimitive.Content>, TabsContentProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Content ref={ref} className={cx(styles.content, className)} {...props} />
  ),
);

TabsContent.displayName = "TabsContent";
