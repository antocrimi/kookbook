"use client";

/* eslint-disable @next/next/no-img-element -- prototype design uses raw <img> for hero, back, time-badge SVG-as-img. */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { displayQuantity, ingredientLabel, type UnitSystem } from "@/lib/units";
import type { Ingredient, Recipe, Step } from "@/lib/types";
import { CookingMode } from "./CookingMode";

interface RecipeViewProps {
  recipe: Recipe;
  photoUrl: string | null;
}

function groupBy<T>(items: T[], key: (item: T) => string | undefined): [string | null, T[]][] {
  const groups = new Map<string | null, T[]>();
  for (const item of items) {
    const k = key(item) ?? null;
    const arr = groups.get(k) ?? [];
    arr.push(item);
    groups.set(k, arr);
  }
  return Array.from(groups.entries());
}

export function RecipeView({ recipe, photoUrl }: RecipeViewProps) {
  const [servings, setServings] = useState(recipe.default_servings);
  const [unit, setUnit] = useState<UnitSystem>("imperial");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [cooking, setCooking] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const prepRef = useRef<HTMLHeadingElement | null>(null);

  const scale = servings / recipe.default_servings;

  const ingredientRows = useMemo(
    () =>
      recipe.ingredients.map((ing, idx) => ({
        idx,
        ing,
        qtyStr: displayQuantity(ing, scale, unit),
        label: ingredientLabel(ing),
      })),
    [recipe.ingredients, scale, unit],
  );

  const ingredientGroups = useMemo(
    () => groupBy(ingredientRows, (r) => r.ing.group),
    [ingredientRows],
  );
  const stepGroups = useMemo(
    () => groupBy(
      recipe.steps.map((step, idx) => ({ step, idx })),
      ({ step }) => step.group,
    ),
    [recipe.steps],
  );

  useEffect(() => {
    if (cooking) return;
    const onScroll = () => {
      const prep = prepRef.current;
      if (!prep) return;
      const rect = prep.getBoundingClientRect();
      setStickyVisible(rect.top < window.innerHeight * 0.85);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [cooking]);

  const toggleChecked = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  if (cooking) {
    return (
      <CookingMode
        recipe={recipe}
        ingredientRows={ingredientRows}
        onExit={() => setCooking(false)}
      />
    );
  }

  return (
    <div className="recipe-app">
      <div id="recipe">
        <div className={`sticky-kook${stickyVisible ? " visible" : ""}`}>
          <button className="cta cta-primary" onClick={() => setCooking(true)}>
            <img src="/prototype/assets/cook.svg" width={11} height={12} alt="" />
            Kook It
          </button>
        </div>

        <div className="recipe-hero">
          {photoUrl ? (
            <img className="recipe-hero-img" src={photoUrl} alt={recipe.title} />
          ) : (
            <div style={{ width: "100%", height: "100%" }} />
          )}
          <Link href="/recipes" aria-label="Back">
            <img className="back-btn" src="/prototype/assets/back.svg" alt="Back" />
          </Link>
        </div>

        <div className="recipe-content">
          <h1 className="recipe-title">{recipe.title}</h1>

          <div className="recipe-meta-row">
            {recipe.time_min != null && (
              <div className="time-badge">
                <img src="/prototype/assets/Alarm.svg" width={16} height={16} alt="" />
                {recipe.time_min} MIN
              </div>
            )}
            <button className="cta cta-tertiary" type="button" disabled title="Shop integration TBD">
              <img src="/prototype/assets/shop.svg" width={16} height={16} alt="" style={{ opacity: 0.75 }} />
              Shop
            </button>
            <button className="cta cta-primary" onClick={() => setCooking(true)}>
              <img src="/prototype/assets/cook.svg" width={11} height={12} alt="" />
              Kook It
            </button>
          </div>

          {recipe.description && <p className="recipe-desc">{recipe.description}</p>}

          <h2 className="section-heading">Ingredients</h2>

          <div className="controls">
            <div className="serving-pill">
              <button
                className="serving-btn"
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                aria-label="Fewer servings"
              >
                −
              </button>
              <span className="serving-label">
                {servings} SERVING{servings !== 1 ? "S" : ""}
              </span>
              <button
                className="serving-btn"
                onClick={() => setServings((s) => Math.min(50, s + 1))}
                aria-label="More servings"
              >
                +
              </button>
            </div>
            <button
              className={`unit-toggle${unit === "metric" ? " is-metric" : ""}`}
              onClick={() => setUnit((u) => (u === "imperial" ? "metric" : "imperial"))}
            >
              <img src="/prototype/assets/swap.svg" width={16} height={16} alt="" />
              <span>{unit === "metric" ? "METRIC" : "IMPERIAL"}</span>
            </button>
          </div>

          <ul className="ing-list">
            {ingredientGroups.map(([group, rows]) => (
              <li key={group ?? "__ungrouped"} className="ing-group">
                {group && <span className="ing-group-label">{group}</span>}
                {rows.map(({ idx, ing, qtyStr, label }) => (
                  <IngredientRow
                    key={idx}
                    idx={idx}
                    ing={ing}
                    qtyStr={qtyStr}
                    label={label}
                    checked={checked.has(idx)}
                    onToggle={toggleChecked}
                  />
                ))}
              </li>
            ))}
          </ul>

          <div className="shop-row">
            <button className="cta cta-tertiary" type="button" disabled title="Groceries integration TBD">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Groceries
            </button>
            <button className="cta cta-tertiary" type="button" disabled title="Shop integration TBD">
              <img src="/prototype/assets/shop.svg" width={16} height={16} alt="" style={{ opacity: 0.7 }} />
              Shop
            </button>
          </div>

          <h2 className="section-heading" ref={prepRef}>
            Preparation
          </h2>

          <ol className="step-list">
            {stepGroups.map(([group, items]) => (
              <li key={group ?? "__ungrouped"} className="step-group">
                {group && <span className="step-group-label">{group}</span>}
                {items.map(({ step, idx }) => (
                  <StepRow key={idx} idx={idx} step={step} />
                ))}
              </li>
            ))}
          </ol>

          <div className="recipe-bottom-spacer" />
        </div>
      </div>
    </div>
  );
}

function IngredientRow({
  idx,
  ing,
  qtyStr,
  label,
  checked,
  onToggle,
}: {
  idx: number;
  ing: Ingredient;
  qtyStr: string | null;
  label: string;
  checked: boolean;
  onToggle: (i: number) => void;
}) {
  // Fall back to raw text for items with no parsed item (e.g., "Salt and black pepper").
  const text = ing.item ? label : ing.raw;
  return (
    <div
      className={`ing-row${checked ? " checked" : ""}`}
      onClick={() => onToggle(idx)}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle(idx);
        }
      }}
    >
      <div className="ing-cb">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <polyline
            points="1 4 3.5 6.5 9 1"
            stroke="#0B2826"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="ing-text">
        {qtyStr && <strong>{qtyStr} </strong>}
        {text}
      </span>
    </div>
  );
}

function StepRow({ idx, step }: { idx: number; step: Step }) {
  return (
    <div>
      <span className="step-label">Step {idx + 1}</span>
      <p className="step-body">{step.text}</p>
    </div>
  );
}
