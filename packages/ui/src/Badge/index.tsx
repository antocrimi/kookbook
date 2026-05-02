"use client";

import { Primitive } from "@radix-ui/react-primitive";
import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import styles from "./index.module.scss";

type BadgeVariant = "appended" | "standalone";

type PrimitiveBadgeProps = ComponentPropsWithoutRef<typeof Primitive.span>;

export interface BadgeProps extends Omit<PrimitiveBadgeProps, "children"> {
  children?: ReactNode;
  className?: string;
  variant?: BadgeVariant;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const hasRenderableContent = (content: ReactNode) => {
  if (content === null || content === undefined || content === false) {
    return false;
  }

  if (typeof content === "string") {
    return content.trim().length > 0;
  }

  return true;
};

export const Badge = ({
  children,
  className,
  variant = "standalone",
  ...props
}: BadgeProps) => {
  const hasContent = hasRenderableContent(children);

  return (
    <Primitive.span
      className={cx(
        styles.badge,
        styles[`variant-${variant}`],
        !hasContent && styles.empty,
        className,
      )}
      {...props}
    >
      {children}
    </Primitive.span>
  );
};
