"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactElement,
  type ReactNode,
} from "react";
import styles from "./index.module.scss";

type ToggleGroupSize = "sm" | "md" | "lg";

type PrimitiveToggleGroupProps = ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>;

export type ToggleGroupProps = PrimitiveToggleGroupProps & {
  className?: string;
  size?: ToggleGroupSize;
  children?: ReactNode;
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const ToggleGroup = forwardRef<
  ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(({ className, size = "md", children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cx(styles.group, styles[`size-${size}`], className)}
    {...props}
  >
    {Children.map(children, (child, index) => {
      if (!isValidElement(child)) {
        return child;
      }

      const childProps = child.props as {
        size?: ToggleGroupSize;
        value?: string;
        disabled?: boolean;
      };

      const itemValue =
        typeof childProps.value === "string" && childProps.value.length > 0
          ? childProps.value
          : `toggle-${index}`;

      return (
        <ToggleGroupPrimitive.Item asChild value={itemValue} disabled={childProps.disabled}>
          {cloneElement(child as ReactElement<Record<string, unknown>>, {
            size: childProps.size ?? size,
            value: childProps.value ?? itemValue,
          })}
        </ToggleGroupPrimitive.Item>
      );
    })}
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = "ToggleGroup";
