import type { Ingredient, Unit } from "@/lib/types";

export type UnitSystem = "imperial" | "metric";

const ML_PER: Partial<Record<Unit, number>> = {
  tsp: 5,
  tbsp: 15,
  floz: 30,
  cup: 240,
  pint: 480,
  quart: 960,
  gallon: 3785,
  ml: 1,
  l: 1000,
};
const G_PER: Partial<Record<Unit, number>> = {
  oz: 28,
  lb: 454,
  g: 1,
  kg: 1000,
};

export function unitKind(u: Unit | undefined): "volume" | "weight" | "count" | "length" | "temp" | "none" {
  if (!u) return "none";
  if (u in ML_PER) return "volume";
  if (u in G_PER) return "weight";
  if (u === "whole" || u === "clove" || u === "pinch" || u === "dash" || u === "slice") return "count";
  if (u === "inch" || u === "cm") return "length";
  if (u === "f" || u === "c") return "temp";
  return "none";
}

const FRACS: [number, string][] = [
  [7 / 8, "⅞"],
  [3 / 4, "¾"],
  [2 / 3, "⅔"],
  [1 / 2, "½"],
  [1 / 3, "⅓"],
  [1 / 4, "¼"],
  [1 / 8, "⅛"],
];

function toFrac(n: number): string {
  const whole = Math.floor(n);
  const frac = n - whole;
  let sym = "";
  for (const [v, s] of FRACS) {
    if (Math.abs(frac - v) < 0.07) {
      sym = s;
      break;
    }
  }
  if (whole > 0 && sym) return `${whole} ${sym}`;
  if (sym) return sym;
  if (whole > 0) return `${whole}`;
  return n.toFixed(1);
}

function r5(n: number): number {
  return Math.round(n / 5) * 5 || 1;
}

function formatMetricVolume(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(1)} l`;
  return `${r5(ml)} ml`;
}
function formatMetricWeight(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(1)} kg`;
  return `${r5(g)} g`;
}

function formatOne(value: number, unit: Unit | undefined, system: UnitSystem): string {
  if (system === "metric") {
    if (unit && unit in ML_PER) return formatMetricVolume(value * ML_PER[unit]!);
    if (unit && unit in G_PER) return formatMetricWeight(value * G_PER[unit]!);
  }
  // imperial — or metric for non-convertible (count/length)
  const formatted = toFrac(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function displayQuantity(ing: Ingredient, scale: number, system: UnitSystem): string | null {
  if (ing.quantity) {
    return formatOne(ing.quantity.value * scale, ing.quantity.unit, system);
  }
  if (ing.range) {
    const lowStr = formatOne(ing.range.low * scale, ing.range.unit, system);
    const highStr = formatOne(ing.range.high * scale, ing.range.unit, system);
    return `${lowStr}–${highStr}`;
  }
  return null;
}

export function ingredientLabel(ing: Ingredient): string {
  const base = ing.item;
  return ing.note ? `${base}, ${ing.note}` : base;
}
