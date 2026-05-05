"use client";

/* eslint-disable @next/next/no-img-element -- prototype design uses raw <img> for icons. */
import { useEffect, useState } from "react";
import type { Ingredient, Recipe } from "@/lib/types";

type IngredientRow = {
  idx: number;
  ing: Ingredient;
  qtyStr: string | null;
  label: string;
};

type CookTab = "steps" | "ingredients";

export function CookingMode({
  recipe,
  ingredientRows,
  onExit,
}: {
  recipe: Recipe;
  ingredientRows: IngredientRow[];
  onExit: () => void;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [tab, setTab] = useState<CookTab>("steps");

  // Repaint the page background to the cook-mode color.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("cook-mode");
    return () => html.classList.remove("cook-mode");
  }, []);

  const cookNav = (dir: -1 | 1) => {
    const next = stepIdx + dir;
    if (next < 0) return;
    if (next >= recipe.steps.length) {
      onExit();
      return;
    }
    setStepIdx(next);
  };

  const currentStep = recipe.steps[stepIdx];

  return (
    <div className="recipe-app">
      <div id="cooking" className="active">
        <div className="cook-top">
          <button className="cook-icon-btn" aria-label="Exit cooking mode" onClick={onExit}>
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
            className={`cook-tab${tab === "steps" ? " active" : ""}`}
            onClick={() => setTab("steps")}
          >
            Preparation
          </button>
          <button
            className={`cook-tab${tab === "ingredients" ? " active" : ""}`}
            onClick={() => setTab("ingredients")}
          >
            Ingredients
          </button>
        </div>

        {tab === "steps" ? (
          <div className="cook-panel active">
            <div className="cook-tap-overlay">
              <div
                className="cook-prev-zone"
                onClick={() => cookNav(-1)}
                role="button"
                aria-label="Previous step"
              />
              <div
                className="cook-next-zone"
                onClick={() => cookNav(1)}
                role="button"
                aria-label="Next step"
              />
            </div>

            <div className="cook-body">
              <p className="cook-step-p">{currentStep?.text ?? ""}</p>
            </div>

            <div className="cook-dots-row">
              {recipe.steps.map((_, i) => (
                <div key={i} className={`dot${i === stepIdx ? " active" : ""}`} />
              ))}
            </div>

            <div className="cook-cta-row">
              <button className="cta" type="button">
                <img src="/prototype/assets/kooku.svg" width={18} height={16} alt="" />
                Ask Kooku
              </button>
            </div>
          </div>
        ) : (
          <div className="cook-panel active">
            <div className="cook-ing-panel">
              {ingredientRows.map(({ idx, ing, qtyStr, label }) => (
                <div key={idx} className="cook-ing-row">
                  <span className="cook-ing-text">
                    {qtyStr && <strong>{qtyStr} </strong>}
                    {ing.item ? label : ing.raw}
                  </span>
                </div>
              ))}
            </div>
            <div className="cook-cta-row">
              <button className="cta" type="button">
                <img src="/prototype/assets/kooku.svg" width={18} height={16} alt="" />
                Ask Kooku
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
