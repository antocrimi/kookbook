"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SEED_RECIPES } from "./seedData";

export function SeedRecipe() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function seed() {
    setError(null);
    const supabase = createSupabaseBrowserClient();

    const { data: folder } = await supabase
      .from("folders")
      .select("id")
      .eq("is_inbox", true)
      .single();
    if (!folder) {
      setError("No Inbox folder found (signup trigger may not have fired)");
      return;
    }

    const { data: existing } = await supabase.from("recipes").select("title");
    const existingTitles = new Set((existing ?? []).map((r) => r.title));

    const toInsert = SEED_RECIPES.filter((r) => !existingTitles.has(r.title)).map(
      (r) => ({
        folder_id: folder.id,
        title: r.title,
        source: r.source,
        description: r.description,
        default_servings: r.default_servings,
        time_min: r.time_min,
        ingredients: r.ingredients,
        steps: r.steps,
        original_photo_path: r.original_photo_path,
      }),
    );

    if (toInsert.length === 0) {
      startTransition(() => router.refresh());
      return;
    }

    const { error: insertError } = await supabase.from("recipes").insert(toInsert);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <>
      <button type="button" onClick={seed} disabled={pending}>
        {pending ? "Seeding…" : "Seed demo recipes"}
      </button>
      {error && <span style={{ color: "var(--recipe-primary)", fontSize: 12, padding: "0 12px" }}>{error}</span>}
    </>
  );
}
