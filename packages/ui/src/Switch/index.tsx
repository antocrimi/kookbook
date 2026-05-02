"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import styles from "./index.module.scss";

type PrimitiveSwitchProps = ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>;

export interface SwitchProps extends PrimitiveSwitchProps {
  className?: string;
  thumbClassName?: string;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const Switch = forwardRef<ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, thumbClassName, ...props }, ref) => (
    <SwitchPrimitive.Root ref={ref} className={cx(styles.switch, className)} {...props}>
      <SwitchPrimitive.Thumb className={cx(styles.thumb, thumbClassName)} />
    </SwitchPrimitive.Root>
  ),
);

Switch.displayName = "Switch";
