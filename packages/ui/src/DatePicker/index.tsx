"use client";

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { DayPicker, type Matcher } from "react-day-picker";
import styles from "./index.module.scss";

type DatePickerVariant = "solid" | "outline" | "ghost";
type DatePickerMessageType = "error" | "warning" | "info";
type DatePickerSize = "fixed" | "full";
export type DateFormat = "mm/dd/yyyy" | "dd/mm/yyyy" | "yyyy/mm/dd";

export interface DatePickerProps {
  name?: string;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  label?: string;
  labelClassName?: string;
  placeholder?: string;
  message?: string;
  messageType?: DatePickerMessageType;
  error?: boolean;
  variant?: DatePickerVariant;
  size?: DatePickerSize;
  fixedWidth?: number | string;
  min?: string;
  max?: string;
  disabledDates?: Matcher | Matcher[];
  disabled?: boolean;
  id?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  clearButtonLabel?: string;
  openCalendarLabel?: string;
  triggerIcon?: ReactNode;
  required?: boolean;
  dateFormat?: DateFormat;
}

type SegmentType = "y" | "m" | "d";
type Segment = { type: SegmentType; index: number; start: number; end: number };
type CalendarView = "days" | "months" | "years";

const YEARS_PER_PAGE = 16;
const MONTH_LONG = Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat(undefined, { month: "long" }).format(new Date(2000, i, 1)),
);
const MONTH_SHORT = Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat(undefined, { month: "short" }).format(new Date(2000, i, 1)),
);

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const FORMAT_ORDER: Record<DateFormat, SegmentType[]> = {
  "mm/dd/yyyy": ["m", "d", "y"],
  "dd/mm/yyyy": ["d", "m", "y"],
  "yyyy/mm/dd": ["y", "m", "d"],
};

const getSegments = (format: DateFormat): Segment[] => {
  const segments: Segment[] = [];
  let pos = 0;
  format.split("/").forEach((part, index) => {
    segments.push({
      type: part[0] as SegmentType,
      index,
      start: pos,
      end: pos + part.length,
    });
    pos += part.length + 1;
  });
  return segments;
};

const parseIso = (iso: string | null | undefined): Date | undefined => {
  if (!iso) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const formatIso = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const isoToDisplay = (iso: string | null | undefined, format: DateFormat): string => {
  const date = parseIso(iso ?? undefined);
  if (!date) return "";
  const y = `${date.getFullYear()}`;
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return format.replace("yyyy", y).replace("mm", m).replace("dd", d);
};

const parseDisplay = (input: string, format: DateFormat): string | null => {
  const parts = input.split("/");
  if (parts.length !== 3) return null;
  const order = FORMAT_ORDER[format];
  const bucket: Record<SegmentType, string> = { y: "", m: "", d: "" };
  order.forEach((key, i) => {
    bucket[key] = parts[i] ?? "";
  });
  if (bucket.y.length !== 4 || !/^\d{4}$/.test(bucket.y)) return null;
  if (!/^\d{1,2}$/.test(bucket.m) || !/^\d{1,2}$/.test(bucket.d)) return null;
  const y = Number(bucket.y);
  const m = Number(bucket.m);
  const d = Number(bucket.d);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return `${y}-${pad2(m)}-${pad2(d)}`;
};

const getFixedWidth = (fixedWidth: DatePickerProps["fixedWidth"]) => {
  if (typeof fixedWidth === "number") return `${fixedWidth}px`;
  return fixedWidth ?? "360px";
};

const buildDisabledMatcher = (
  min: string | undefined,
  max: string | undefined,
  disabledDates: Matcher | Matcher[] | undefined,
): Matcher | Matcher[] | undefined => {
  const matchers: Matcher[] = [];
  const minDate = parseIso(min);
  const maxDate = parseIso(max);
  if (minDate) matchers.push({ before: minDate });
  if (maxDate) matchers.push({ after: maxDate });
  if (Array.isArray(disabledDates)) matchers.push(...disabledDates);
  else if (disabledDates !== undefined) matchers.push(disabledDates);
  if (matchers.length === 0) return undefined;
  if (matchers.length === 1) return matchers[0];
  return matchers;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

const segmentInitial = (type: SegmentType): string => {
  const today = new Date();
  if (type === "m") return pad2(today.getMonth() + 1);
  if (type === "d") return pad2(today.getDate());
  return `${today.getFullYear()}`;
};

const segmentStep = (type: SegmentType, current: string, delta: number): string => {
  const n = Number(current);
  if (!current || Number.isNaN(n)) return segmentInitial(type);
  if (type === "m") {
    let next = n + delta;
    if (next < 1) next = 12;
    if (next > 12) next = 1;
    return pad2(next);
  }
  if (type === "d") {
    let next = n + delta;
    if (next < 1) next = 31;
    if (next > 31) next = 1;
    return pad2(next);
  }
  return `${clamp(n + delta, 1, 9999)}`;
};

export const DatePicker = ({
  name,
  value,
  defaultValue,
  onValueChange,
  label,
  labelClassName,
  placeholder,
  message,
  messageType = "info",
  error = false,
  variant = "outline",
  size = "fixed",
  fixedWidth,
  min,
  max,
  disabledDates,
  disabled = false,
  id,
  className,
  triggerClassName,
  contentClassName,
  clearButtonLabel = "Clear date",
  openCalendarLabel = "Open calendar",
  triggerIcon,
  required,
  dateFormat = "mm/dd/yyyy",
}: DatePickerProps) => {
  const reactId = useId();
  const fieldId = id ?? `datepicker-${reactId}`;
  const messageId = message ? `${fieldId}-message` : undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(null);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | null>(() => defaultValue ?? null);
  const currentValue = isControlled ? value ?? null : internalValue;

  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState<string>(() => isoToDisplay(currentValue, dateFormat));
  const [view, setView] = useState<CalendarView>("days");
  const [displayMonth, setDisplayMonth] = useState<Date>(
    () => parseIso(currentValue ?? undefined) ?? parseIso(min) ?? new Date(),
  );

  useEffect(() => {
    if (!open) {
      setView("days");
      const next = parseIso(currentValue ?? undefined) ?? parseIso(min) ?? new Date();
      setDisplayMonth(next);
    }
  }, [open, currentValue, min]);

  useEffect(() => {
    setInputText(isoToDisplay(currentValue, dateFormat));
  }, [currentValue, dateFormat]);

  useEffect(() => {
    if (pendingSelectionRef.current && inputRef.current) {
      const { start, end } = pendingSelectionRef.current;
      inputRef.current.setSelectionRange(start, end);
      pendingSelectionRef.current = null;
    }
  });

  const segments = useMemo(() => getSegments(dateFormat), [dateFormat]);

  const selectedDate = useMemo(() => parseIso(currentValue ?? undefined), [currentValue]);

  const disabledMatcher = useMemo(
    () => buildDisabledMatcher(min, max, disabledDates),
    [min, max, disabledDates],
  );

  const rootStyle: CSSProperties | undefined =
    size === "fixed" ? ({ "--date-picker-fixed-width": getFixedWidth(fixedWidth) } as CSSProperties) : undefined;

  const commit = (next: string | null) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const selectSegmentLater = (segment: Segment) => {
    pendingSelectionRef.current = { start: segment.start, end: segment.end };
    if (inputRef.current) {
      inputRef.current.setSelectionRange(segment.start, segment.end);
    }
    requestAnimationFrame(() => {
      if (pendingSelectionRef.current && inputRef.current) {
        const { start, end } = pendingSelectionRef.current;
        inputRef.current.setSelectionRange(start, end);
        pendingSelectionRef.current = null;
      }
    });
  };

  const getSegmentAtCursor = (): Segment => {
    const input = inputRef.current;
    const cursor = input?.selectionStart ?? 0;
    return (
      segments.find((seg) => cursor >= seg.start && cursor <= seg.end) ?? segments[0]!
    );
  };

  const stepSegment = (segment: Segment, delta: number) => {
    const parts = (inputText.length > 0 ? inputText : dateFormat).split("/");
    const currentRaw = parts[segment.index] ?? "";
    const currentDigits = /^\d+$/.test(currentRaw) ? currentRaw : "";
    const nextRaw = segmentStep(segment.type, currentDigits, delta);
    parts[segment.index] = nextRaw;
    const nextText = parts.join("/");
    setInputText(nextText);
    const parsed = parseDisplay(nextText, dateFormat);
    if (parsed !== null) commit(parsed);
    const newEnd = segment.start + nextRaw.length;
    pendingSelectionRef.current = { start: segment.start, end: newEnd };
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      commit(null);
      setInputText("");
      return;
    }
    const iso = formatIso(date);
    commit(iso);
    setInputText(isoToDisplay(iso, dateFormat));
    setOpen(false);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setInputText(next);
    if (next === "") {
      commit(null);
      return;
    }
    const parsed = parseDisplay(next, dateFormat);
    if (parsed !== null) commit(parsed);
  };

  const handleInputBlur = () => {
    if (inputText === "") {
      commit(null);
      return;
    }
    const parsed = parseDisplay(inputText, dateFormat);
    if (parsed !== null) {
      setInputText(isoToDisplay(parsed, dateFormat));
    } else {
      setInputText(isoToDisplay(currentValue, dateFormat));
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      stepSegment(getSegmentAtCursor(), 1);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      stepSegment(getSegmentAtCursor(), -1);
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const direction = event.key === "ArrowLeft" ? -1 : 1;
      const current = getSegmentAtCursor();
      const nextIdx = clamp(current.index + direction, 0, segments.length - 1);
      if (nextIdx !== current.index) {
        event.preventDefault();
        selectSegmentLater(segments[nextIdx]!);
      }
      return;
    }
    if (event.key === "Escape" && open) {
      setOpen(false);
    }
  };

  const handleFieldPointerDown = () => {
    if (disabled) return;
    if (!open) setOpen(true);
  };

  const handleInputFocus = () => {
    if (!inputRef.current) return;
    const seg = getSegmentAtCursor();
    selectSegmentLater(seg);
  };

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    commit(null);
    setInputText("");
    inputRef.current?.focus();
  };

  const hasValue = inputText.length > 0;
  const resolvedPlaceholder = placeholder ?? dateFormat;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
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

        <PopoverPrimitive.Anchor asChild>
          <div
            ref={triggerRef}
            className={cx(styles.trigger, triggerClassName)}
            onPointerDown={handleFieldPointerDown}
          >
            <input
              ref={inputRef}
              id={fieldId}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className={styles.input}
              placeholder={resolvedPlaceholder}
              value={inputText}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              disabled={disabled}
              aria-invalid={error || undefined}
              aria-describedby={messageId}
              aria-required={required || undefined}
              aria-haspopup="dialog"
              aria-expanded={open}
            />

            {hasValue && !disabled ? (
              <button
                type="button"
                aria-label={clearButtonLabel}
                className={styles.clearButton}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleClear}
              >
                <CrossCircledIcon aria-hidden />
              </button>
            ) : null}

            <PopoverPrimitive.Trigger asChild>
              <button
                type="button"
                aria-label={openCalendarLabel}
                className={styles.calendarButton}
                disabled={disabled}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {triggerIcon ?? <CalendarIcon aria-hidden />}
              </button>
            </PopoverPrimitive.Trigger>

            {name ? (
              <input type="hidden" name={name} value={currentValue ?? ""} required={required} />
            ) : null}
          </div>
        </PopoverPrimitive.Anchor>

        {message ? (
          <p id={messageId} className={cx(styles.message, styles[`message-${messageType}`])}>
            {messageType === "info" ? <InfoCircledIcon aria-hidden /> : <ExclamationTriangleIcon aria-hidden />}
            <span>{message}</span>
          </p>
        ) : null}
      </div>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cx(styles.content, contentClassName)}
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
          onInteractOutside={(event) => {
            const target = event.target as Node | null;
            if (target && triggerRef.current?.contains(target)) {
              event.preventDefault();
            }
          }}
        >
          <CalendarPanel
            view={view}
            onViewChange={setView}
            displayMonth={displayMonth}
            onDisplayMonthChange={setDisplayMonth}
            selectedDate={selectedDate}
            onDaySelect={handleSelect}
            disabledMatcher={disabledMatcher}
            minDate={parseIso(min) ?? new Date(1900, 0, 1)}
            maxDate={parseIso(max) ?? new Date(2100, 11, 31)}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

type CalendarPanelProps = {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  displayMonth: Date;
  onDisplayMonthChange: (date: Date) => void;
  selectedDate: Date | undefined;
  onDaySelect: (date: Date | undefined) => void;
  disabledMatcher: Matcher | Matcher[] | undefined;
  minDate: Date;
  maxDate: Date;
};

const CalendarPanel = ({
  view,
  onViewChange,
  displayMonth,
  onDisplayMonthChange,
  selectedDate,
  onDaySelect,
  disabledMatcher,
  minDate,
  maxDate,
}: CalendarPanelProps) => {
  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();

  if (view === "days") {
    const prev = () => onDisplayMonthChange(new Date(year, month - 1, 1));
    const next = () => onDisplayMonthChange(new Date(year, month + 1, 1));
    const canPrev = new Date(year, month, 1) > new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const canNext = new Date(year, month, 1) < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <button
            type="button"
            className={styles.navButton}
            onClick={prev}
            disabled={!canPrev}
            aria-label="Previous month"
          >
            <ChevronLeftIcon aria-hidden />
          </button>
          <button
            type="button"
            className={styles.headerLabel}
            onClick={() => onViewChange("months")}
          >
            {MONTH_LONG[month]} {year}
          </button>
          <button
            type="button"
            className={styles.navButton}
            onClick={next}
            disabled={!canNext}
            aria-label="Next month"
          >
            <ChevronRightIcon aria-hidden />
          </button>
        </div>
        <DayPicker
          mode="single"
          month={displayMonth}
          onMonthChange={onDisplayMonthChange}
          selected={selectedDate}
          onSelect={onDaySelect}
          disabled={disabledMatcher}
          showOutsideDays
          hideNavigation
          startMonth={minDate}
          endMonth={maxDate}
          components={{ MonthCaption: () => <></> }}
          className={styles.calendar}
        />
      </div>
    );
  }

  if (view === "months") {
    const prev = () => onDisplayMonthChange(new Date(year - 1, month, 1));
    const next = () => onDisplayMonthChange(new Date(year + 1, month, 1));
    const canPrev = year > minDate.getFullYear();
    const canNext = year < maxDate.getFullYear();
    const selectMonth = (m: number) => {
      onDisplayMonthChange(new Date(year, m, 1));
      onViewChange("days");
    };

    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <button
            type="button"
            className={styles.navButton}
            onClick={prev}
            disabled={!canPrev}
            aria-label="Previous year"
          >
            <ChevronLeftIcon aria-hidden />
          </button>
          <button
            type="button"
            className={styles.headerLabel}
            onClick={() => onViewChange("years")}
          >
            {year}
          </button>
          <button
            type="button"
            className={styles.navButton}
            onClick={next}
            disabled={!canNext}
            aria-label="Next year"
          >
            <ChevronRightIcon aria-hidden />
          </button>
        </div>
        <div className={cx(styles.pickerGrid, styles.pickerGridMonths)}>
          {MONTH_SHORT.map((m, i) => {
            const disabled =
              (year === minDate.getFullYear() && i < minDate.getMonth()) ||
              (year === maxDate.getFullYear() && i > maxDate.getMonth());
            return (
              <button
                type="button"
                key={i}
                className={cx(styles.pickerCell, i === month && styles.pickerCellSelected)}
                onClick={() => selectMonth(i)}
                disabled={disabled}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const yearStart = Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;
  const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearStart + i);
  const prevYears = () => onDisplayMonthChange(new Date(year - YEARS_PER_PAGE, month, 1));
  const nextYears = () => onDisplayMonthChange(new Date(year + YEARS_PER_PAGE, month, 1));
  const canPrev = yearStart > minDate.getFullYear();
  const canNext = yearStart + YEARS_PER_PAGE - 1 < maxDate.getFullYear();
  const selectYear = (y: number) => {
    onDisplayMonthChange(new Date(y, month, 1));
    onViewChange("months");
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <button
          type="button"
          className={styles.navButton}
          onClick={prevYears}
          disabled={!canPrev}
          aria-label="Previous years"
        >
          <ChevronLeftIcon aria-hidden />
        </button>
        <span className={styles.headerLabelStatic}>
          {yearStart} – {yearStart + YEARS_PER_PAGE - 1}
        </span>
        <button
          type="button"
          className={styles.navButton}
          onClick={nextYears}
          disabled={!canNext}
          aria-label="Next years"
        >
          <ChevronRightIcon aria-hidden />
        </button>
      </div>
      <div className={cx(styles.pickerGrid, styles.pickerGridYears)}>
        {years.map((y) => {
          const disabled = y < minDate.getFullYear() || y > maxDate.getFullYear();
          return (
            <button
              type="button"
              key={y}
              className={cx(styles.pickerCell, y === year && styles.pickerCellSelected)}
              onClick={() => selectYear(y)}
              disabled={disabled}
            >
              {y}
            </button>
          );
        })}
      </div>
    </div>
  );
};
