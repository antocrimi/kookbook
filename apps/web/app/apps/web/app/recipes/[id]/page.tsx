import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Recipe } from "@/lib/types";
import { RecipeView } from "./RecipeView";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !recipe) notFound();

  let photoUrl: string | null = null;
  if (recipe.original_photo_path) {
    const { data } = supabase.storage
      .from("recipe-photos")
      .getPublicUrl(recipe.original_photo_path);
    photoUrl = data.publicUrl;
  }

  return <RecipeView recipe={recipe as Recipe} photoUrl={photoUrl} />;
}
