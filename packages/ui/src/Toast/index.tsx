"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import {
  CheckCircledIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import styles from "./index.module.scss";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type PrimitiveToastRootProps = ComponentPropsWithoutRef<typeof ToastPrimitive.Root>;
type PrimitiveToastViewportProps = ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>;

export type ToastVariant = "error" | "warning" | "info" | "success";

export interface ToastProps extends PrimitiveToastRootProps {
  className?: string;
  variant?: ToastVariant;
  heading: ReactNode;
  body?: ReactNode;
  icon?: ReactNode;
  closeLabel?: string;
  persistent?: boolean;
}

export interface ToastViewportProps extends PrimitiveToastViewportProps {
  className?: string;
}

const iconByVariant: Record<ToastVariant, ReactNode> = {
  error: <ExclamationTriangleIcon aria-hidden />,
  warning: <ExclamationTriangleIcon aria-hidden />,
  info: <InfoCircledIcon aria-hidden />,
  success: <CheckCircledIcon aria-hidden />,
};

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = forwardRef<
  ElementRef<typeof ToastPrimitive.Viewport>,
  ToastViewportProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cx(styles.viewport, className)}
    {...props}
  />
));

ToastViewport.displayName = "ToastViewport";

export const Toast = forwardRef<ElementRef<typeof ToastPrimitive.Root>, ToastProps>(
  (
    {
      className,
      variant = "info",
      heading,
      body,
      icon,
      closeLabel = "Dismiss notification",
      persistent = false,
      duration,
      ...props
    },
    ref,
  ) => (
    <ToastPrimitive.Root
      ref={ref}
      className={cx(styles.toast, styles[`type-${variant}`], className)}
      duration={persistent ? Number.POSITIVE_INFINITY : duration}
      {...props}
    >
      <div className={styles.icon}>{icon ?? iconByVariant[variant]}</div>
      <div className={styles.content}>
        <ToastPrimitive.Title className={styles.title}>{heading}</ToastPrimitive.Title>
        {body ? (
          <ToastPrimitive.Description className={styles.description}>
            {body}
          </ToastPrimitive.Description>
        ) : null}
      </div>
      <ToastPrimitive.Close asChild>
        <button type="button" className={styles.close} aria-label={closeLabel}>
          <Cross2Icon aria-hidden />
        </button>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  ),
);

Toast.displayName = "Toast";

export const ToastTitle = ToastPrimitive.Title;
export const ToastDescription = ToastPrimitive.Description;
export const ToastAction = ToastPrimitive.Action;
export const ToastClose = ToastPrimitive.Close;
