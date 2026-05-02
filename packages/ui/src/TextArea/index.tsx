"use client";

import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import {
  forwardRef,
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ElementRef,
  useId,
} from "react";
import styles from "./index.module.scss";

type PrimitiveTextAreaProps = ComponentPropsWithoutRef<"textarea">;

type TextAreaVariant = "solid" | "outline";
type TextAreaMessageType = "error" | "warning" | "info";
type TextAreaSize = "fixed" | "full";

export interface TextAreaProps extends PrimitiveTextAreaProps {
  className?: string;
  textAreaClassName?: string;
  label?: string;
  labelClassName?: string;
  message?: string;
  messageType?: TextAreaMessageType;
  error?: boolean;
  variant?: TextAreaVariant;
  size?: TextAreaSize;
  fixedWidth?: number | string;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const getFixedWidth = (fixedWidth: TextAreaProps["fixedWidth"]) => {
  if (typeof fixedWidth === "number") {
    return `${fixedWidth}px`;
  }

  return fixedWidth ?? "360px";
};

export const TextArea = forwardRef<ElementRef<"textarea">, TextAreaProps>(
  (
    {
      className,
      textAreaClassName,
      label,
      labelClassName,
      message,
      messageType = "info",
      error = false,
      variant = "outline",
      size = "fixed",
      fixedWidth,
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const fieldId = id ?? `textarea-${reactId}`;
    const messageId = message ? `${fieldId}-message` : undefined;

    const rootStyle: CSSProperties | undefined =
      size === "fixed"
        ? ({ "--text-area-fixed-width": getFixedWidth(fixedWidth) } as CSSProperties)
        : undefined;

    return (
      <div
        className={cx(
          styles.root,
          styles[`variant-${variant}`],
          styles[`size-${size}`],
          error && styles["state-error"],
          disabled && styles["state-disabled"],
          className,
        )}
        style={rootStyle}
      >
        {label ? (
          <label htmlFor={fieldId} className={cx(styles.label, labelClassName)}>
            {label}
          </label>
        ) : null}

        <div className={styles.control}>
          <textarea
            {...props}
            id={fieldId}
            ref={ref}
            rows={rows}
            disabled={disabled}
            aria-invalid={error || undefined}
            aria-describedby={messageId}
            className={cx(styles.textArea, textAreaClassName)}
          />
        </div>

        {message ? (
          <p id={messageId} className={cx(styles.message, styles[`message-${messageType}`])}>
            {messageType === "info" ? <InfoCircledIcon aria-hidden /> : <ExclamationTriangleIcon aria-hidden />}
            <span>{message}</span>
          </p>
        ) : null}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";
