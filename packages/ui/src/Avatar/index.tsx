"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { type ComponentPropsWithoutRef, useMemo } from "react";
import { tokens } from "../tokens";
import styles from "./index.module.scss";

type AvatarSize = "sm" | "md" | "lg";

type PrimitiveAvatarProps = ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>;

export interface AvatarProps extends PrimitiveAvatarProps {
  className?: string;
  src?: string;
  alt?: string;
  name?: string;
  fallback?: string;
  size?: AvatarSize;
  imageClassName?: string;
  fallbackClassName?: string;
  delayMs?: number;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const FALLBACK_COLORS = [
  tokens.primitive.color.solids.green["500"].value,
  tokens.primitive.color.solids.teal["500"].value,
  tokens.primitive.color.solids["light-blue"]["500"].value,
  tokens.primitive.color.solids.blue["500"].value,
  tokens.primitive.color.solids.indigo["500"].value,
  tokens.primitive.color.solids.violet["500"].value,
  tokens.primitive.color.solids.purple["500"].value,
  tokens.primitive.color.solids.fuchsia["400"].value,
  tokens.primitive.color.solids.pink["500"].value,
  tokens.primitive.color.solids.ros["500"].value,
  tokens.primitive.color.solids.red["400"].value,
  tokens.primitive.color.solids["dark-orange"]["300"].value,
];

const getInitials = (name?: string) => {
  if (!name) {
    return "?";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  const initials = parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return initials.toUpperCase();
};

const pickFallbackColor = (seed: string) => {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
};

export const Avatar = ({
  className,
  src,
  alt,
  name,
  fallback,
  size = "md",
  imageClassName,
  fallbackClassName,
  delayMs = 0,
  ...props
}: AvatarProps) => {
  const fallbackLabel = fallback ?? getInitials(name);

  const fallbackBackgroundColor = useMemo(
    () => pickFallbackColor(name?.trim() || fallbackLabel),
    [fallbackLabel, name],
  );

  return (
    <AvatarPrimitive.Root
      className={cx(styles.avatar, styles[`size-${size}`], className)}
      {...props}
    >
      <AvatarPrimitive.Image
        className={cx(styles.image, imageClassName)}
        src={src}
        alt={alt ?? name ?? "User avatar"}
      />
      <AvatarPrimitive.Fallback
        className={cx(styles.fallback, fallbackClassName)}
        delayMs={delayMs}
        style={{ backgroundColor: fallbackBackgroundColor }}
      >
        {fallbackLabel}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
};
