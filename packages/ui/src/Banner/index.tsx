"use client";

import {
  CheckCircledIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import {
  forwardRef,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./index.module.scss";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export type BannerVariant = "error" | "warning" | "info" | "success";

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: BannerVariant;
  heading: ReactNode;
  body?: ReactNode;
  icon?: ReactNode;
  closeLabel?: string;
  dismissible?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const iconByVariant: Record<BannerVariant, ReactNode> = {
  error: <ExclamationTriangleIcon aria-hidden />,
  warning: <ExclamationTriangleIcon aria-hidden />,
  info: <InfoCircledIcon aria-hidden />,
  success: <CheckCircledIcon aria-hidden />,
};

export const Banner = forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      className,
      variant = "info",
      heading,
      body,
      icon,
      closeLabel = "Dismiss notification",
      dismissible = true,
      open,
      defaultOpen = true,
      onOpenChange,
      ...props
    },
    ref,
  ) => {
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
      <div
        ref={ref}
        className={cx(styles.banner, styles[`type-${variant}`], className)}
        role="status"
        {...props}
      >
        <div className={styles.icon}>{icon ?? iconByVariant[variant]}</div>
        <div className={styles.content}>
          <p className={styles.title}>{heading}</p>
          {body ? <p className={styles.description}>{body}</p> : null}
        </div>
        {dismissible ? (
          <button
            type="button"
            className={styles.close}
            aria-label={closeLabel}
            onClick={() => {
              if (!isControlled) {
                setInternalOpen(false);
              }
              onOpenChange?.(false);
            }}
          >
            <Cross2Icon aria-hidden />
          </button>
        ) : null}
      </div>
    );
  },
);

Banner.displayName = "Banner";
