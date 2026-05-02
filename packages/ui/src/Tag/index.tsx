"use client";

import { Primitive } from "@radix-ui/react-primitive";
import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import styles from "./index.module.scss";

type TagVariant = "solid" | "outline";

type PrimitiveTagProps = ComponentPropsWithoutRef<typeof Primitive.span>;

export interface TagProps extends Omit<PrimitiveTagProps, "children"> {
  children: ReactNode;
  className?: string;
  variant?: TagVariant;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const Tag = ({
  children,
  className,
  variant = "solid",
  ...props
}: TagProps) => (
  <Primitive.span
    className={cx(styles.tag, styles[`variant-${variant}`], className)}
    {...props}
  >
    {children}
  </Primitive.span>
);
