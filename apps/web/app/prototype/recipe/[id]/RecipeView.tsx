"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Ingredient, RecipeDetail } from "../../data";

type Unit = "imperial" | "metric";
type CookTab = "steps" | "ingredients";

const ML: Record<string, number> = { tsp: 5, tbsp: 15, cup: 240, floz: 30, pint: 480, quart: 960 };
const GM: Record<string, number> = { oz: 28, lb: 454 };
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
  return whole > 0 ? `${whole}` : n.toFixed(1);
}

function r5(n: number) {
  return Math.round(n / 5) * 5 || 1;
}

function displayQty(ing: Ingredient, scale: number, unit: Unit): string | null {
  if (ing.qty === null) return null;
  const q = ing.qty * scale;
  if (unit === "imperial") return `${toFrac(q)} ${ing.unit}`;
  if (ing.type === "volume" && ing.unit && ML[ing.unit]) {
    const ml = q * ML[ing.unit];
    return ml >= 1000 ? `${(ml / 1000).toFixed(1)} l` : `${r5(ml)} ml`;
  }
  if (ing.type === "weight" && ing.unit && GM[ing.unit]) {
    const g = q * GM[ing.unit];
    return g >= 1000 ? `${(g / 1000).toFixed(1)} kg` : `${r5(g)} g`;
  }
  return `${toFrac(q)} ${ing.unit ?? ""}`.trim();
}

export function RecipeView({ recipe }: { recipe: RecipeDetail }) {
  const [servings, setServings] = useState(recipe.defaultServings);
  const [unit, setUnit] = useState<Unit>("imperial");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [cooking, setCooking] = useState(false);
  const [cookStep, setCookStep] = useState(0);
  const [cookTab, setCookTab] = useState<CookTab>("steps");
  const [stickyVisible, setStickyVisible] = useState(false);
  const prepRef = useRef<HTMLHeadingElement | null>(null);

  const scale = servings / recipe.defaultServings;
  const ingredientRows = useMemo(
    () =>
      recipe.ingredients.map((ing) => ({
        ing,
        qtyStr: displayQty(ing, scale, unit),
      })),
    [recipe.ingredients, scale, unit],
  );

  // Cooking-mode background: toggle html.cook-mode like the static prototype.
  useEffect(() => {
    const html = document.documentElement;
    if (cooking) html.classList.add("cook-mode");
    else html.classList.remove("cook-mode");
    return () => html.classList.remove("cook-mode");
  }, [cooking]);

  // Sticky "KOOK IT" appears once Preparation section is near the viewport.
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

  const startCooking = () => {
    setCookStep(0);
    setCookTab("steps");
    setCooking(true);
  };

  const cookNav = (dir: -1 | 1) => {
    const nextStep = cookStep + dir;
    if (nextStep < 0) return;
    if (nextStep >= recipe.steps.length) {
      setCooking(false);
      return;
    }
    setCookStep(nextStep);
  };

  if (cooking) {
    return (
      <div id="cooking" className="active">
        <div className="cook-top">
          <button className="cook-icon-btn" aria-label="Exit" onClick={() => setCooking(false)}>
            <img src="/prototype/assets/close.svg" width={13} height={13} alt="Close" />
          </button>
          <div className="cook-header-title">
            <img src="/prototype/assets/kooku Beige.png" className="cook-bird-img" alt="" />
            <span className="cook-title-text">Kook It!</span>
          </div>
          <button className="cook-icon-btn" aria-label="Voice control">
            <img src="/prototype/assets/megaphone.svg" width={22} height={22} alt="Voice" />
          </button>
        </div>

        <div className="cook-tab-bar">
          <button
            className={`cook-tab${cookTab === "steps" ? " active" : ""}`}
            onClick={() => setCookTab("steps")}
          >
            Preparation
          </button>
          <button
            className={`cook-tab${cookTab === "ingredients" ? " active" : ""}`}
            onClick={() => setCookTab("ingredients")}
          >
            Ingredients
          </button>
        </div>

        {cookTab === "steps" ? (
          <div className="cook-panel active">
            <div className="cook-tap-overlay">
              <div className="cook-prev-zone" onClick={() => cookNav(-1)}></div>
              <div className="cook-next-zone" onClick={() => cookNav(1)}></div>
            </div>

            <div className="cook-body">
              <p className="cook-step-p">{recipe.steps[cookStep]}</p>
            </div>

            <div className="cook-dots-row">
              {recipe.steps.map((_, i) => (
                <div key={i} className={`dot${i === cookStep ? " active" : ""}`}></div>
              ))}
            </div>

            <div className="cook-cta-row">
              <button className="cta">
                <img src="/prototype/assets/kooku.svg" width={18} height={16} alt="" />
                Ask Kooku
              </button>
            </div>
          </div>
        ) : (
          <div className="cook-panel active">
            <div className="cook-ing-panel">
              {ingredientRows.map(({ ing, qtyStr }, i) => (
                <div key={i} className="cook-ing-row">
                  <span className="cook-ing-text">
                    {qtyStr && <strong>{qtyStr} </strong>}
                    {ing.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="cook-cta-row">
              <button className="cta">
                <img src="/prototype/assets/kooku.svg" width={18} height={16} alt="" />
                Ask Kooku
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="recipe" className="active">
      <div className={`sticky-kook${stickyVisible ? " visible" : ""}`}>
        <button className="cta cta-primary" onClick={startCooking}>
          <img src="/prototype/assets/cook.svg" width={11} height={12} alt="" />
          Kook It
        </button>
      </div>

      <div className="recipe-hero">
        <img className="recipe-hero-img" src={recipe.photo} alt={recipe.title} />
        <Link href="/prototype/recipes" aria-label="Back">
          <img className="back-btn" src="/prototype/assets/back.svg" alt="Back" />
        </Link>
      </div>

      <div className="recipe-content">
        <h1 className="recipe-title">{recipe.title}</h1>

        <div className="recipe-meta-row">
          <div className="time-badge">
            <img src="/prototype/assets/Alarm.svg" width={16} height={16} alt="" />
            {recipe.timeMin} MIN
          </div>
          <button className="cta cta-tertiary">
            <img src="/prototype/assets/shop.svg" width={16} height={16} alt="" style={{ opacity: 0.75 }} />
            Shop
          </button>
          <button className="cta cta-primary" onClick={startCooking}>
            <img src="/prototype/assets/cook.svg" width={11} height={12} alt="" />
            Kook It
          </button>
        </div>

        <p className="recipe-desc">{recipe.description}</p>

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
          {ingredientRows.map(({ ing, qtyStr }, i) => {
            const isChecked = checked.has(i);
            return (
              <li
                key={i}
                className={`ing-row${isChecked ? " checked" : ""}`}
                onClick={() => toggleChecked(i)}
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
                  {ing.text}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="shop-row">
          <button className="cta cta-tertiary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Groceries
          </button>
          <button className="cta cta-tertiary">
            <img src="/prototype/assets/shop.svg" width={16} height={16} alt="" style={{ opacity: 0.7 }} />
            Shop
          </button>
        </div>

        <h2 className="section-heading" ref={prepRef}>
          Preparation
        </h2>

        <ol className="step-list">
          {recipe.steps.map((s, i) => (
            <li key={i}>
              <span className="step-label">Step {i + 1}</span>
              <p className="step-body">{s}</p>
            </li>
          ))}
        </ol>

        <div className="recipe-bottom-spacer"></div>
      </div>
    </div>
  );
}
