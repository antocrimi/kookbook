"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Primitive } from "@radix-ui/react-primitive";
import {
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import styles from "./index.module.scss";

type ChipVariant = "outline" | "ghost";

type PrimitiveChipProps = ComponentPropsWithoutRef<typeof Primitive.span>;

export interface ChipProps extends Omit<PrimitiveChipProps, "children"> {
  children: ReactNode;
  className?: string;
  variant?: ChipVariant;
  icon?: ReactNode;
  removable?: boolean;
  removeLabel?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const Chip = ({
  children,
  className,
  variant = "ghost",
  icon,
  removable = true,
  removeLabel = "Remove chip",
  open,
  defaultOpen = true,
  onOpenChange,
  onRemove,
  ...props
}: ChipProps) => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isOpen = useMemo(
    () => (isControlled ? Boolean(open) : internalOpen),
    [internalOpen, isControlled, open],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Primitive.span
      className={cx(styles.chip, styles[`variant-${variant}`], className)}
      {...props}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
      {removable ? (
        <div className={styles.action}>
          <button
            type="button"
            className={styles.remove}
            aria-label={removeLabel}
            onClick={(event) => {
              if (!isControlled) {
                setInternalOpen(false);
              }
              onOpenChange?.(false);
              onRemove?.(event);
            }}
          >
            <Cross2Icon aria-hidden />
          </button>
        </div>
      ) : null}
    </Primitive.span>
  );
};
