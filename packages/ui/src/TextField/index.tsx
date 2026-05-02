"use client";

import { CrossCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import {
  forwardRef,
  type CSSProperties,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type ElementRef,
  useId,
  useMemo,
  useState,
} from "react";
import styles from "./index.module.scss";

type PrimitiveInputProps = ComponentPropsWithoutRef<"input">;

type TextFieldVariant = "solid" | "outline" | "exposed";
type TextFieldMessageType = "error" | "warning" | "info";
type TextFieldSize = "fixed" | "full";

export interface TextFieldProps extends Omit<PrimitiveInputProps, "size"> {
  className?: string;
  inputClassName?: string;
  label?: string;
  labelClassName?: string;
  message?: string;
  messageType?: TextFieldMessageType;
  error?: boolean;
  variant?: TextFieldVariant;
  size?: TextFieldSize;
  fixedWidth?: number | string;
  clearButtonLabel?: string;
  onClear?: () => void;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const getStringValue = (value: PrimitiveInputProps["value"]) => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return `${value}`;
  }

  return "";
};

const getFixedWidth = (fixedWidth: TextFieldProps["fixedWidth"]) => {
  if (typeof fixedWidth === "number") {
    return `${fixedWidth}px`;
  }

  return fixedWidth ?? "360px";
};

export const TextField = forwardRef<ElementRef<"input">, TextFieldProps>(
  (
    {
      className,
      inputClassName,
      label,
      labelClassName,
      message,
      messageType = "info",
      error = false,
      variant = "outline",
      size = "fixed",
      fixedWidth,
      clearButtonLabel = "Clear input",
      onClear,
      id,
      onChange,
      value,
      defaultValue,
      disabled,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const fieldId = id ?? `textfield-${reactId}`;
    const messageId = message ? `${fieldId}-message` : undefined;

    const [internalValue, setInternalValue] = useState(() => {
      if (typeof defaultValue === "string") {
        return defaultValue;
      }

      if (typeof defaultValue === "number") {
        return `${defaultValue}`;
      }

      return "";
    });

    const isControlled = value !== undefined;
    const inputValue = isControlled ? getStringValue(value) : internalValue;
    const hasValue = useMemo(() => inputValue.length > 0, [inputValue]);
    const hasError = error;

    const rootStyle: CSSProperties | undefined =
      size === "fixed"
        ? ({ "--text-field-fixed-width": getFixedWidth(fixedWidth) } as CSSProperties)
        : undefined;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(event.target.value);
      }

      onChange?.(event);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue("");
      }

      onClear?.();
    };

    return (
      <div
        className={cx(
          styles.root,
          styles[`variant-${variant}`],
          styles[`size-${size}`],
          hasError && styles["state-error"],
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
          <input
            {...props}
            id={fieldId}
            ref={ref}
            value={inputValue}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={messageId}
            className={cx(styles.input, inputClassName)}
          />

          {hasValue && !disabled ? (
            <button
              type="button"
              aria-label={clearButtonLabel}
              className={styles.clearButton}
              onClick={handleClear}
            >
              <CrossCircledIcon aria-hidden />
            </button>
          ) : null}
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

TextField.displayName = "TextField";
