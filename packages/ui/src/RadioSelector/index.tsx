"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { type ComponentPropsWithoutRef, type ReactNode, useId } from "react";
import styles from "./index.module.scss";

type PrimitiveRadioGroupProps = ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>;
type PrimitiveRadioItemProps = ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>;
type RadioSelectorMessageType = "error" | "warning" | "info";

export interface RadioSelectorProps extends PrimitiveRadioGroupProps {
  className?: string;
  error?: boolean;
}

export interface RadioSelectorItemProps extends PrimitiveRadioItemProps {
  className?: string;
  label?: ReactNode;
  labelClassName?: string;
  message?: string;
  messageType?: RadioSelectorMessageType;
  error?: boolean;
}

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

export const RadioSelector = ({ className, error = false, ...props }: RadioSelectorProps) => (
  <RadioGroupPrimitive.Root
    {...props}
    aria-invalid={error || undefined}
    className={cx(styles.group, error && styles["group-error"], className)}
  />
);

export const RadioSelectorItem = ({
  className,
  label,
  labelClassName,
  message,
  messageType = "info",
  error = false,
  disabled,
  id,
  ...props
}: RadioSelectorItemProps) => {
  const reactId = useId();
  const radioId = id ?? `radio-selector-${reactId}`;
  const labelId = label ? `${radioId}-label` : undefined;
  const messageId = message ? `${radioId}-message` : undefined;

  return (
    <div
      className={cx(
        styles.item,
        error && styles["item-error"],
        disabled && styles["item-disabled"],
        className,
      )}
    >
      <div className={styles.controlRow}>
        <RadioGroupPrimitive.Item
          id={radioId}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={messageId}
          className={styles.radio}
          {...props}
        >
          <RadioGroupPrimitive.Indicator className={styles.indicator} />
        </RadioGroupPrimitive.Item>

        {label ? (
          <label htmlFor={radioId} id={labelId} className={cx(styles.label, labelClassName)}>
            {label}
          </label>
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
};
