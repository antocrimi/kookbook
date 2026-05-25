"use client";

/* eslint-disable @next/next/no-img-element -- prototype design uses raw <img> for the wordmark logo. */
import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { RecipeCard } from "./RecipeCard";
import { SeedRecipe } from "./SeedRecipe";
import { SignOut } from "./SignOut";

type RecipeRow = {
  id: string;
  title: string;
  time_min: number | null;
  updated_at: string;
  original_photo_path: string | null;
  photoUrl: string | null;
};

function resolvePhotoUrl(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  path: string | null,
): string | null {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return supabase.storage.from("recipe-photos").getPublicUrl(path).data.publicUrl;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, time_min, updated_at, original_photo_path")
        .eq("is_draft", false)
        .order("updated_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setRecipes([]);
        return;
      }

      const withPhotos = (data ?? []).map((r) => ({
        ...r,
        photoUrl: resolvePhotoUrl(supabase, r.original_photo_path),
      }));
      setRecipes(withPhotos);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="recipe-app">
      <div className="page" id="index">
        <header className="home-header">
          <button
            className="menu-btn"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <img className="home-logo" src="/prototype/assets/logo.png" alt="Cuckoobook" />
          <Link href="/capture" className="add-btn" aria-label="Add recipe">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
          {menuOpen && (
            <div className="menu-dropdown" role="menu">
              <Link href="/drafts" onClick={() => setMenuOpen(false)}>Drafts</Link>
              <Link href="/settings" onClick={() => setMenuOpen(false)}>Settings</Link>
              <SeedRecipe />
              <SignOut />
            </div>
          )}
        </header>

        <div className="saved-section">
          <div className="saved-header">
            <h2 className="saved-title">Saved Recipes</h2>
            <button className="saved-chevron" aria-label="Filter">
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
                <path d="M1 1l8 8 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <hr className="saved-divider" />
        </div>

        {error && (
          <div className="recipes-error">Couldn&apos;t load recipes — {error}</div>
        )}

        {recipes === null ? null : recipes.length > 0 ? (
          <div className="recipe-grid">
            {recipes.map((r) => (
              <RecipeCard
                key={r.id}
                id={r.id}
                title={r.title}
                timeMin={r.time_min}
                photoUrl={r.photoUrl}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2 className="empty-heading">Your recipe collection starts here.</h2>
            <p className="empty-body">
              Snap a photo of a cookbook page and let AI extract the recipe. Or open the menu and seed demo recipes to explore the design.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
