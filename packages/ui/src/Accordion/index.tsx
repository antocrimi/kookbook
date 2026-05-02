"use client";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type ElementRef, type ReactNode } from "react";
import styles from "./index.module.scss";

type PrimitiveAccordionProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>;
type PrimitiveAccordionItemProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>;
type PrimitiveAccordionTriggerProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>;
type PrimitiveAccordionContentProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>;

type AccordionWidth = "fixed" | "fullWidth";

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

const getFixedWidth = (fixedWidth: number | string | undefined) => {
  if (typeof fixedWidth === "number") {
    return `${fixedWidth}px`;
  }

  return fixedWidth ?? "360px";
};

export type AccordionProps = PrimitiveAccordionProps & {
  className?: string;
  children?: ReactNode;
  width?: AccordionWidth;
  fixedWidth?: number | string;
};

export const Accordion = forwardRef<ElementRef<typeof AccordionPrimitive.Root>, AccordionProps>(
  ({ className, width = "fixed", fixedWidth, ...props }, ref) => {
    const style: CSSProperties | undefined =
      width === "fixed"
        ? ({ "--accordion-fixed-width": getFixedWidth(fixedWidth) } as CSSProperties)
        : undefined;

    return (
      <AccordionPrimitive.Root
        ref={ref}
        className={cx(styles.accordion, styles[`width-${width}`], className)}
        style={style}
        {...props}
      />
    );
  },
);

Accordion.displayName = "Accordion";

export type AccordionItemProps = PrimitiveAccordionItemProps & {
  className?: string;
};

export const AccordionItem = forwardRef<ElementRef<typeof AccordionPrimitive.Item>, AccordionItemProps>(
  ({ className, ...props }, ref) => (
    <AccordionPrimitive.Item ref={ref} className={cx(styles.item, className)} {...props} />
  ),
);

AccordionItem.displayName = "AccordionItem";

export type AccordionTriggerProps = Omit<PrimitiveAccordionTriggerProps, "children"> & {
  className?: string;
  children?: ReactNode;
};

export const AccordionTrigger = forwardRef<ElementRef<typeof AccordionPrimitive.Trigger>, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className={styles.header}>
      <AccordionPrimitive.Trigger ref={ref} className={cx(styles.trigger, className)} {...props}>
        <span className={styles.triggerLabel}>{children}</span>
        <ChevronDownIcon className={styles.chevron} aria-hidden />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  ),
);

AccordionTrigger.displayName = "AccordionTrigger";

export type AccordionContentProps = PrimitiveAccordionContentProps & {
  className?: string;
};

export const AccordionContent = forwardRef<ElementRef<typeof AccordionPrimitive.Content>, AccordionContentProps>(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content ref={ref} className={cx(styles.content, className)} {...props}>
      <div className={styles.contentInner}>{children}</div>
    </AccordionPrimitive.Content>
  ),
);

AccordionContent.displayName = "AccordionContent";
