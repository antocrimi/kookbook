"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementRef,
} from "react";
import styles from "./index.module.scss";

type PrimitiveProgressProps = ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>;
type ProgressVariant = "linear" | "circle";
type ProgressSize = "fixed" | "fullWidth";

export interface ProgressIndicatorProps extends PrimitiveProgressProps {
  className?: string;
  indicatorClassName?: string;
  variant?: ProgressVariant;
  size?: ProgressSize;
  fixedSize?: number | string;
  circleThickness?: number;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const toCssSize = (size: number | string) =>
  typeof size === "number" ? `${size}px` : size;

const clampValue = (value: number) => Math.min(100, Math.max(0, value));

export const ProgressIndicator = forwardRef<
  ElementRef<typeof ProgressPrimitive.Root>,
  ProgressIndicatorProps
>(
  (
    {
      className,
      indicatorClassName,
      value,
      max = 100,
      variant = "linear",
      size = "fixed",
      fixedSize = 360,
      circleThickness = 8,
      style,
      ...props
    },
    ref,
  ) => {
    const normalizedValue =
      typeof value === "number" && max > 0 ? clampValue((value / max) * 100) : undefined;

    const rootStyle = {
      ...style,
      ...(size === "fixed" ? { "--progress-size": toCssSize(fixedSize) } : {}),
    } as CSSProperties;

    if (variant === "circle") {
      const circleRadius = 50 - circleThickness / 2;
      const circumference = 2 * Math.PI * circleRadius;
      const strokeOffset =
        normalizedValue === undefined
          ? circumference * 0.6
          : circumference - (normalizedValue / 100) * circumference;

      return (
        <ProgressPrimitive.Root
          ref={ref}
          className={cx(
            styles.progress,
            styles["variant-circle"],
            size === "fullWidth" && styles["size-full-width"],
            className,
          )}
          value={value}
          max={max}
          style={rootStyle}
          {...props}
        >
          <svg
            className={styles["circle-svg"]}
            viewBox="0 0 100 100"
            aria-hidden="true"
            focusable="false"
          >
            <circle
              className={styles["circle-track"]}
              cx="50"
              cy="50"
              r={circleRadius}
              strokeWidth={circleThickness}
            />
            <ProgressPrimitive.Indicator asChild>
              <circle
                className={cx(styles["circle-indicator"], indicatorClassName)}
                cx="50"
                cy="50"
                r={circleRadius}
                strokeWidth={circleThickness}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeOffset,
                }}
              />
            </ProgressPrimitive.Indicator>
          </svg>
        </ProgressPrimitive.Root>
      );
    }

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cx(
          styles.progress,
          styles["variant-linear"],
          size === "fullWidth" && styles["size-full-width"],
          className,
        )}
        value={value}
        max={max}
        style={rootStyle}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cx(styles["linear-indicator"], indicatorClassName)}
          style={{
            transform:
              normalizedValue === undefined
                ? undefined
                : `translateX(calc(-100% + ${normalizedValue}%))`,
          }}
        />
      </ProgressPrimitive.Root>
    );
  },
);

ProgressIndicator.displayName = "ProgressIndicator";
