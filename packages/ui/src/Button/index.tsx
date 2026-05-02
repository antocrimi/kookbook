"use client";

import { Primitive } from "@radix-ui/react-primitive";
import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import styles from "./index.module.scss";

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonTone = "primary" | "critical";
type ButtonSize = "xs" | "sm" | "md" | "lg";

type PrimitiveButtonProps = ComponentPropsWithoutRef<typeof Primitive.button>;

export interface ButtonProps
  extends Omit<PrimitiveButtonProps, "children" | "size"> {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const Button = ({
  children,
  className,
  variant = "solid",
  tone = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  iconOnly = false,
  disabled,
  type,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Primitive.button
      className={cx(
        styles.button,
        styles[`variant-${variant}`],
        styles[`tone-${tone}`],
        styles[`size-${size}`],
        fullWidth && styles["full-width"],
        loading && styles.loading,
        iconOnly && styles["icon-only"],
        className,
      )}
      data-loading={loading ? "true" : undefined}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      type={type ?? "button"}
      {...props}
    >
      {children}
    </Primitive.button>
  );
};
