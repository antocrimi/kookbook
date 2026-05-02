"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import styles from "./index.module.scss";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type PrimitiveDialogContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;

export interface DialogContentProps extends PrimitiveDialogContentProps {
  className?: string;
  closeLabel?: string;
  eyebrow?: ReactNode;
  heading: ReactNode;
  description?: ReactNode;
}

export interface DialogActionsProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
}

export interface DialogActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "default" | "primary";
}

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cx(styles.overlay, className)} {...props} />
));

DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, closeLabel = "Close dialog", eyebrow, heading, description, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} className={cx(styles.content, className)} {...props}>
      <div className={styles.header}>
        <div className={styles.headingGroup}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <DialogPrimitive.Title className={styles.title}>{heading}</DialogPrimitive.Title>
        </div>
        <DialogPrimitive.Close asChild>
          <button type="button" className={styles.close} aria-label={closeLabel}>
            <Cross2Icon aria-hidden />
          </button>
        </DialogPrimitive.Close>
      </div>

      {description ? (
        <DialogPrimitive.Description className={styles.description}>
          {description}
        </DialogPrimitive.Description>
      ) : null}

      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));

DialogContent.displayName = "DialogContent";

export const DialogActions = ({ className, ...props }: DialogActionsProps) => (
  <div className={cx(styles.actions, className)} {...props} />
);

export const DialogAction = forwardRef<HTMLButtonElement, DialogActionProps>(
  ({ className, type = "button", variant = "default", ...props }, ref) => (
    <DialogPrimitive.Close asChild>
      <button
        ref={ref}
        type={type}
        className={cx(styles.action, variant === "primary" && styles.primary, className)}
        {...props}
      />
    </DialogPrimitive.Close>
  ),
);

DialogAction.displayName = "DialogAction";

export const DialogClose = DialogPrimitive.Close;
