"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementRef,
  useEffect,
  useState,
} from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../Tooltip/index";
import styles from "./index.module.scss";

type PrimitiveSliderProps = ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;
type SliderWidthMode = "fixed" | "fullWidth";

export interface SliderProps extends PrimitiveSliderProps {
  className?: string;
  trackClassName?: string;
  rangeClassName?: string;
  thumbClassName?: string;
  formatValue?: (value: number) => string;
  widthMode?: SliderWidthMode;
  fixedWidth?: number | string;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const toCssSize = (width: number | string) =>
  typeof width === "number" ? `${width}px` : width;

export const Slider = forwardRef<ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  (
    {
      className,
      trackClassName,
      rangeClassName,
      thumbClassName,
      formatValue,
      onValueChange,
      value,
      defaultValue,
      min = 0,
      max = 100,
      widthMode = "fixed",
      fixedWidth = 360,
      style,
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<number[]>(
      value ?? defaultValue ?? [min],
    );
    const [isPressing, setIsPressing] = useState(false);
    const [activeThumbIndex, setActiveThumbIndex] = useState<number | null>(null);
    const [focusedThumbIndex, setFocusedThumbIndex] = useState<number | null>(null);

    const currentValue = isControlled ? (value as number[]) : internalValue;

    useEffect(() => {
      const clearPressed = () => {
        setIsPressing(false);
        setActiveThumbIndex(null);
        setFocusedThumbIndex(null);
      };

      window.addEventListener("pointerup", clearPressed);
      window.addEventListener("pointercancel", clearPressed);

      return () => {
        window.removeEventListener("pointerup", clearPressed);
        window.removeEventListener("pointercancel", clearPressed);
      };
    }, []);

    const handleValueChange = (nextValue: number[]) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue);
    };

    const rootStyle: CSSProperties = {
      ...style,
      ...(widthMode === "fixed" ? { "--slider-width": toCssSize(fixedWidth) } : {}),
    } as CSSProperties;

    const getValueLabel = (thumbValue: number) =>
      formatValue ? formatValue(thumbValue) : `${Math.round(thumbValue)}`;

    return (
      <TooltipProvider delayDuration={0}>
        <SliderPrimitive.Root
          ref={ref}
          className={cx(styles.slider, widthMode === "fullWidth" && styles["slider-full-width"], className)}
          min={min}
          max={max}
          value={value}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          style={rootStyle}
          {...props}
        >
          <SliderPrimitive.Track className={cx(styles.track, trackClassName)}>
            <SliderPrimitive.Range className={cx(styles.range, rangeClassName)} />
          </SliderPrimitive.Track>
          {currentValue.map((thumbValue, index) => (
            <Tooltip
              key={index}
              open={(isPressing && activeThumbIndex === index) || focusedThumbIndex === index}
            >
              <TooltipTrigger asChild>
                <SliderPrimitive.Thumb
                  className={cx(styles.thumb, thumbClassName)}
                  onPointerDown={() => {
                    setIsPressing(true);
                    setActiveThumbIndex(index);
                  }}
                  onFocus={() => {
                    setFocusedThumbIndex(index);
                  }}
                  onBlur={() => {
                    setFocusedThumbIndex((current) => (current === index ? null : current));
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                {getValueLabel(thumbValue)}
              </TooltipContent>
            </Tooltip>
          ))}
        </SliderPrimitive.Root>
      </TooltipProvider>
    );
  },
);

Slider.displayName = "Slider";
