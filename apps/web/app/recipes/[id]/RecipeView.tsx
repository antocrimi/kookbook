"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Checkbox } from "@cuckoobook/ui";
import type { Recipe, Ingredient } from "@/lib/types";
import styles from "./RecipeView.module.scss";

interface RecipeViewProps {
  recipe: Recipe;
  photoUrl: string | null;
}

function formatQuantity(ing: Ingredient, scale: number): { qty: string | null; text: string } {
  if (ing.quantity) {
    const raw = ing.quantity.value * scale;
    const rounded = Math.abs(raw - Math.round(raw)) < 0.02 ? Math.round(raw) : parseFloat(raw.toFixed(1));
    return {
      qty: `${rounded} ${ing.quantity.unit}`,
      text: `${ing.item}${ing.note ? `, ${ing.note}` : ""}`,
    };
  }
  if (ing.range) {
    const low = parseFloat((ing.range.low * scale).toFixed(1));
    const high = parseFloat((ing.range.high * scale).toFixed(1));
    return {
      qty: `${low}–${high} ${ing.range.unit}`,
      text: `${ing.item}${ing.note ? `, ${ing.note}` : ""}`,
    };
  }
  return { qty: null, text: ing.raw };
}

function groupBy<T>(items: T[], key: (item: T) => string | undefined): [string | null, T[]][] {
  const map = new Map<string | null, T[]>();
  for (const item of items) {
    const k = key(item) ?? null;
    const arr = map.get(k) ?? [];
    arr.push(item);
    map.set(k, arr);
  }
  return Array.from(map.entries());
}

export function RecipeView({ recipe, photoUrl }: RecipeViewProps) {
  const [servings, setServings] = useState(recipe.default_servings);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const scale = servings / recipe.default_servings;

  function toggleIngredient(idx: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  const ingredientGroups = groupBy(
    recipe.ingredients.map((ing, idx) => ({ ing, idx })),
    ({ ing }) => ing.group,
  );

  const stepGroups = groupBy(
    recipe.steps.map((step, idx) => ({ step, idx })),
    ({ step }) => step.group,
  );

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full bg-line" />
        )}
        <Link href="/recipes" className={styles.backBtn} aria-label="Back to recipes">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Title + meta */}
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{recipe.title}</h1>
          {recipe.source && (
            <p className={styles.source}>{recipe.source}</p>
          )}
          <div className={styles.meta}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 5V8.5L10.5 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span>20 MIN</span>
          </div>
        </div>

        {/* Ingredients section */}
        <section className={styles.section}>
          <h2 className={styles.displayHeading}>Ingredients</h2>

          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.servingControl}>
              <button
                className={styles.servingBtn}
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                aria-label="Decrease servings"
              >
                −
              </button>
              <span className={styles.servingLabel}>{servings} SERV.</span>
              <button
                className={styles.servingBtn}
                onClick={() => setServings((s) => Math.min(50, s + 1))}
                aria-label="Increase servings"
              >
                +
              </button>
            </div>
            <div className={styles.unitChip}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2 7a5 5 0 1 0 10 0A5 5 0 0 0 2 7Zm3-1.5L7 7l2-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              METRIC
            </div>
          </div>

          {/* Ingredient list */}
          <ul className={styles.ingredientList}>
            {ingredientGroups.map(([group, items]) => (
              <li key={group ?? "__ungrouped"} className={styles.ingredientGroup}>
                {group && (
                  <span className={styles.groupLabel}>{group}</span>
                )}
                <ul className={styles.ingredientItems}>
                  {items.map(({ ing, idx }) => {
                    const { qty, text } = formatQuantity(ing, scale);
                    const isChecked = checked.has(idx);
                    return (
                      <li key={idx} className={`${styles.ingredientRow} ${isChecked ? styles.checked : ""}`}>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleIngredient(idx)}
                          aria-label={text}
                        />
                        <span className={styles.ingredientText}>
                          {qty && <strong className={styles.qty}>{qty}</strong>}
                          {" "}{text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>

          {/* Post-MVP: Groceries + Shop CTAs */}
          <div className={styles.shopRow}>
            <Button variant="outline" size="sm" disabled>
              + Groceries
            </Button>
            <Button variant="outline" size="sm" disabled>
              🛒 Shop
            </Button>
          </div>
        </section>

        {/* Preparation section */}
        <section className={styles.section}>
          <h2 className={styles.displayHeading}>Preparation</h2>

          <ol className={styles.stepList}>
            {stepGroups.map(([group, items]) => (
              <li key={group ?? "__ungrouped"} className={styles.stepGroup}>
                {group && (
                  <span className={styles.groupLabel}>{group}</span>
                )}
                {items.map(({ step, idx }) => (
                  <div key={idx} className={styles.stepRow}>
                    <span className={styles.stepLabel}>Step {idx + 1}</span>
                    <p className={styles.stepText}>{step.text}</p>
                  </div>
                ))}
              </li>
            ))}
          </ol>
        </section>

        {/* Bottom spacer for floating CTA */}
        <div className="h-28" />
      </div>

      {/* Floating Cook CTA */}
      <div className={styles.cookBar}>
        <Button asChild size="lg">
          <Link href={`/recipes/${recipe.id}/cook`}>Cook</Link>
        </Button>
      </div>
    </div>
  );
}
