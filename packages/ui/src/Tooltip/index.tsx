"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import styles from "./index.module.scss";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type TooltipProviderProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>;
type TooltipRootProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>;
type TooltipTriggerProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>;
type TooltipContentPrimitiveProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>;

type TooltipSide = "top" | "right" | "bottom" | "left";

export interface TooltipContentProps extends TooltipContentPrimitiveProps {
  className?: string;
  arrowClassName?: string;
  sideOffset?: number;
  side?: TooltipSide;
}

export const TooltipProvider = TooltipPrimitive.Provider;

export const Tooltip = TooltipPrimitive.Root;

export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, arrowClassName, sideOffset = 8, side = "top", ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      className={cx(styles.content, className)}
      side={side}
      sideOffset={sideOffset}
      {...props}
    >
      {props.children}
      <TooltipPrimitive.Arrow className={cx(styles.arrow, arrowClassName)} width={10} height={5} />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));

TooltipContent.displayName = "TooltipContent";

export type { TooltipProviderProps, TooltipRootProps, TooltipTriggerProps };
