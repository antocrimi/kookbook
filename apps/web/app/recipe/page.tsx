"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Banner } from "@cuckoobook/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Recipe } from "@/lib/types";
import { RecipeView } from "./RecipeView";

function RecipeBody() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");

  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ok"; recipe: Recipe; photoUrl: string | null }
    | { status: "error"; message: string }
  >({ status: "loading" });

  useEffect(() => {
    if (!id) {
      router.replace("/recipes");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (cancelled) return;

      if (error || !data) {
        setState({ status: "error", message: error?.message ?? "Recipe not found" });
        return;
      }

      let photoUrl: string | null = null;
      if (data.original_photo_path) {
        photoUrl = supabase.storage
          .from("recipe-photos")
          .getPublicUrl(data.original_photo_path).data.publicUrl;
      }
      setState({ status: "ok", recipe: data as Recipe, photoUrl });
    })();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (state.status === "loading") return null;
  if (state.status === "error") {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-8">
        <Banner variant="error" heading="Couldn't load recipe" body={state.message} />
      </main>
    );
  }
  return <RecipeView recipe={state.recipe} photoUrl={state.photoUrl} />;
}

export default function RecipePage() {
  return (
    <Suspense fallback={null}>
      <RecipeBody />
    </Suspense>
  );
}
