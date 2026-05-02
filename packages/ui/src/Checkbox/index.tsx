"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { type ComponentPropsWithoutRef, type ReactNode, useId } from "react";
import styles from "./index.module.scss";

type CheckboxTone = "default" | "critical";

type PrimitiveCheckboxProps = ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

export interface CheckboxProps extends PrimitiveCheckboxProps {
  className?: string;
  tone?: CheckboxTone;
  label?: ReactNode;
  labelClassName?: string;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const Checkbox = ({
  className,
  tone = "default",
  disabled,
  label,
  labelClassName,
  id,
  ...props
}: CheckboxProps) => {
  const reactId = useId();
  const checkboxId = id ?? `checkbox-${reactId}`;

  const {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...rootProps
  } = props;

  const labelId = label ? `${checkboxId}-label` : undefined;
  const resolvedAriaLabelledBy =
    ariaLabelledBy ?? (!ariaLabel && label ? labelId : undefined);

  const checkbox = (
    <CheckboxPrimitive.Root
      id={checkboxId}
      className={cx(
        styles.checkbox,
        tone === "critical" && styles["tone-critical"],
        className,
      )}
      aria-label={ariaLabel}
      aria-labelledby={resolvedAriaLabelledBy}
      disabled={disabled}
      {...rootProps}
    >
      <CheckboxPrimitive.Indicator className={styles.indicator}>
        <svg
          aria-hidden
          className={styles.check}
          viewBox="0 0 12 12"
        >
          <polyline points="2 6.5 5 9 10 3" />
        </svg>
        <span aria-hidden className={styles.indeterminate} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label) {
    return checkbox;
  }

  return (
    <div
      className={cx(
        styles.field,
        tone === "critical" && styles["field-tone-critical"],
        disabled && styles["field-disabled"],
      )}
    >
      {checkbox}
      <label htmlFor={checkboxId} id={labelId} className={cx(styles.label, labelClassName)}>
        {label}
      </label>
    </div>
  );
};
