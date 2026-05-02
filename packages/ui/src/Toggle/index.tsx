"use client";

import * as TogglePrimitive from "@radix-ui/react-toggle";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import styles from "./index.module.scss";

type ToggleSize = "sm" | "md" | "lg";

type PrimitiveToggleProps = ComponentPropsWithoutRef<typeof TogglePrimitive.Root>;

export interface ToggleProps extends Omit<PrimitiveToggleProps, "children"> {
  children?: ReactNode;
  className?: string;
  size?: ToggleSize;
  icon?: ReactNode;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const Toggle = forwardRef<ElementRef<typeof TogglePrimitive.Root>, ToggleProps>(
  ({ children, className, size = "md", disabled, icon, ...props }, ref) => (
    <TogglePrimitive.Root
      ref={ref}
      className={cx(styles.toggle, styles[`size-${size}`], className)}
      disabled={disabled}
      {...props}
    >
      {icon}
      {children}
    </TogglePrimitive.Root>
  ),
);

Toggle.displayName = "Toggle";
