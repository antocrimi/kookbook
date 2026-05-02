"use client";

/**
 * DropdownMenu — wraps `@radix-ui/react-dropdown-menu`.
 *
 * Sibling to the existing `Select` component but for action menus
 * (mixing navigation, modal triggers, and submenus) rather than form
 * input. Reach for `Select` when the user is picking a value out of a
 * list; reach for `DropdownMenu` when each item is a different action
 * with a different consequence.
 *
 * The exports mirror the Radix primitive surface 1:1 so consumers can
 * compose any menu shape — submenus, separators, labels, destructive
 * items, checkbox/radio items. Primitives that don't need styling
 * (Root, Trigger, Portal, Sub, Group) are re-exported directly; the
 * ones that need themed surfaces or hover states get a forwardRef
 * wrapper that applies our SCSS module classes.
 *
 * Visual language matches the existing account dropdown surface in
 * `apps/canvas/app/components/layout/CanvasShell/canvas-shell.module.scss`
 * — same raised-2 fill, same elevation mixin, same brand-tinted shadow,
 * same `text-body-regular` items with the highlighted-surface hover.
 * Adopting this component should feel identical to the existing
 * surface so swapping it in for the `<details>` account menu (a
 * separate cleanup) is purely structural.
 */

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import styles from "./index.module.scss";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

/* ─────────────────────────────────────────────
 * Root primitives — re-exported directly
 * ───────────────────────────────────────────── */

/**
 * Note on `DropdownMenuTrigger`: it's intentionally an unstyled
 * `<button>` by default. The expectation is that consumers wrap
 * their own button via Radix's `asChild` pattern:
 *
 * ```tsx
 * <DropdownMenuTrigger asChild>
 *   <Button variant="ghost">Open menu</Button>
 * </DropdownMenuTrigger>
 * ```
 *
 * This keeps the trigger flexible — it can be any clickable element
 * (Button, link, IconButton, custom) while still inheriting the
 * Radix accessibility wiring (aria-haspopup, aria-expanded, focus
 * management). All `DropdownMenu*.stories.tsx` examples use this
 * pattern; consumers should too.
 */
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/* ─────────────────────────────────────────────
 * Content (top-level menu surface)
 * ───────────────────────────────────────────── */

/**
 * Props for the menu surface. Extends Radix's `Content` props so all
 * positioning options are available — most notably:
 *
 *   - `side`: "top" | "right" | "bottom" | "left" (default `"bottom"`)
 *     Which side of the trigger to render the menu on.
 *
 *   - `align`: "start" | "center" | "end" (default `"center"`)
 *     Alignment along the chosen side. For a `bottom`-side menu this
 *     controls the x-axis alignment relative to the trigger:
 *       - `"start"`  → menu's left edge aligns with the trigger's left edge
 *                      (in LTR; in RTL languages it's the right edge)
 *       - `"center"` → menu is centred on the trigger
 *       - `"end"`    → menu's right edge aligns with the trigger's right edge
 *
 *     We use Radix's `start`/`end` rather than `left`/`right` because
 *     it stays correct under RTL. See the `Aligned` Storybook story
 *     for a side-by-side rendering of all three.
 *
 *   - `sideOffset`: number (default `6`)
 *     Pixel gap between the trigger and the menu.
 *
 *   - `alignOffset`: number (default `0`)
 *     Pixel offset along the alignment axis — useful for nudging the
 *     menu a few pixels left/right of where Radix would place it.
 *
 * Any other Radix Content prop (`avoidCollisions`, `collisionPadding`,
 * `sticky`, etc.) is also forwarded.
 */
export interface DropdownMenuContentProps
  extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {
  className?: string;
}

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cx(styles.content, className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));

DropdownMenuContent.displayName = "DropdownMenuContent";

/* ─────────────────────────────────────────────
 * SubContent (nested menu surface)
 * ───────────────────────────────────────────── */

export interface DropdownMenuSubContentProps
  extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> {
  className?: string;
}

export const DropdownMenuSubContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  DropdownMenuSubContentProps
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      sideOffset={sideOffset}
      className={cx(styles.content, className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));

DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

/* ─────────────────────────────────────────────
 * Item — the workhorse
 * ───────────────────────────────────────────── */

export type DropdownMenuItemVariant = "default" | "destructive";

export interface DropdownMenuItemProps
  extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
  className?: string;
  /**
   * Visual variant. `destructive` colours the text with the
   * notifications-error token so dangerous actions (e.g. "Delete
   * project") stand out from the rest of the menu. The hover
   * background stays neutral — the text colour alone signals intent
   * without doubling the visual weight.
   */
  variant?: DropdownMenuItemVariant;
}

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, variant = "default", ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cx(styles.item, styles[`variant-${variant}`], className)}
    {...props}
  />
));

DropdownMenuItem.displayName = "DropdownMenuItem";

/* ─────────────────────────────────────────────
 * SubTrigger — opens a submenu
 * ───────────────────────────────────────────── */

export interface DropdownMenuSubTriggerProps
  extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> {
  className?: string;
}

export const DropdownMenuSubTrigger = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  DropdownMenuSubTriggerProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cx(styles.item, styles.subTrigger, className)}
    {...props}
  >
    <span className={styles.subTriggerLabel}>{children}</span>
    <ChevronRightIcon aria-hidden className={styles.subTriggerIcon} />
  </DropdownMenuPrimitive.SubTrigger>
));

DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

/* ─────────────────────────────────────────────
 * Label — section header inside the menu
 * ───────────────────────────────────────────── */

export interface DropdownMenuLabelProps
  extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> {
  className?: string;
}

export const DropdownMenuLabel = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Label>,
  DropdownMenuLabelProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cx(styles.label, className)}
    {...props}
  />
));

DropdownMenuLabel.displayName = "DropdownMenuLabel";

/* ─────────────────────────────────────────────
 * Separator
 * ───────────────────────────────────────────── */

export interface DropdownMenuSeparatorProps
  extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> {
  className?: string;
}

export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cx(styles.separator, className)}
    {...props}
  />
));

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

/* ─────────────────────────────────────────────
 * CheckboxItem
 * ───────────────────────────────────────────── */

export interface DropdownMenuCheckboxItemProps
  extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> {
  className?: string;
}

export const DropdownMenuCheckboxItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cx(styles.item, styles.checkboxItem, className)}
    {...props}
  >
    <span className={styles.itemIndicator}>
      <DropdownMenuPrimitive.ItemIndicator>✓</DropdownMenuPrimitive.ItemIndicator>
    </span>
    <span className={styles.itemLabel}>{children}</span>
  </DropdownMenuPrimitive.CheckboxItem>
));

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

/* ─────────────────────────────────────────────
 * RadioItem
 * ───────────────────────────────────────────── */

export interface DropdownMenuRadioItemProps
  extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> {
  className?: string;
}

export const DropdownMenuRadioItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  DropdownMenuRadioItemProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cx(styles.item, styles.radioItem, className)}
    {...props}
  >
    <span className={styles.itemIndicator}>
      <DropdownMenuPrimitive.ItemIndicator>•</DropdownMenuPrimitive.ItemIndicator>
    </span>
    <span className={styles.itemLabel}>{children}</span>
  </DropdownMenuPrimitive.RadioItem>
));

DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";
