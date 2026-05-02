"use client";

import { ChevronDownIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import * as SelectPrimitive from "@radix-ui/react-select";
import { type ComponentPropsWithoutRef, type CSSProperties, type ReactNode, useId } from "react";
import styles from "./index.module.scss";

type PrimitiveSelectProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Root>;
type PrimitiveSelectItemProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;

type SelectVariant = "solid" | "outline" | "ghost";
type SelectMessageType = "error" | "warning" | "info";
type SelectSize = "fixed" | "full";

export interface SelectProps extends PrimitiveSelectProps {
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  label?: string;
  labelClassName?: string;
  message?: string;
  messageType?: SelectMessageType;
  error?: boolean;
  variant?: SelectVariant;
  size?: SelectSize;
  fixedWidth?: number | string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  triggerIcon?: ReactNode;
  children: ReactNode;
}

export interface SelectItemProps extends PrimitiveSelectItemProps {
  className?: string;
  children: ReactNode;
}

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

const getFixedWidth = (fixedWidth: SelectProps["fixedWidth"]) => {
  if (typeof fixedWidth === "number") {
    return `${fixedWidth}px`;
  }

  return fixedWidth ?? "360px";
};

export const Select = ({
  className,
  triggerClassName,
  contentClassName,
  label,
  labelClassName,
  message,
  messageType = "info",
  error = false,
  variant = "outline",
  size = "fixed",
  fixedWidth,
  placeholder = "Select an option",
  disabled,
  id,
  triggerIcon,
  children,
  ...props
}: SelectProps) => {
  const reactId = useId();
  const triggerId = id ?? `select-${reactId}`;
  const messageId = message ? `${triggerId}-message` : undefined;

  const rootStyle: CSSProperties | undefined =
    size === "fixed" ? ({ "--select-fixed-width": getFixedWidth(fixedWidth) } as CSSProperties) : undefined;

  return (
    <SelectPrimitive.Root {...props} disabled={disabled}>
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
          <label htmlFor={triggerId} className={cx(styles.label, labelClassName)}>
            {label}
          </label>
        ) : null}

        <SelectPrimitive.Trigger
          id={triggerId}
          aria-invalid={error || undefined}
          aria-describedby={messageId}
          className={cx(styles.trigger, triggerClassName)}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon className={styles.icon}>
            {triggerIcon ?? <ChevronDownIcon aria-hidden />}
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        {message ? (
          <p id={messageId} className={cx(styles.message, styles[`message-${messageType}`])}>
            {messageType === "info" ? <InfoCircledIcon aria-hidden /> : <ExclamationTriangleIcon aria-hidden />}
            <span>{message}</span>
          </p>
        ) : null}
      </div>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className={cx(styles.content, contentClassName)} position="popper" sideOffset={4}>
          <SelectPrimitive.Viewport className={styles.viewport}>{children}</SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

export const SelectItem = ({ className, children, ...props }: SelectItemProps) => (
  <SelectPrimitive.Item className={cx(styles.item, className)} {...props}>
    <SelectPrimitive.ItemText className={styles.itemText}>{children}</SelectPrimitive.ItemText>
    {/* <SelectPrimitive.ItemIndicator className={styles.itemIndicator}>
      <CheckIcon aria-hidden />
    </SelectPrimitive.ItemIndicator> */}
  </SelectPrimitive.Item>
);
