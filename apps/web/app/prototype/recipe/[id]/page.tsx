import { notFound } from "next/navigation";
import { getRecipeDetail, recipes } from "../../data";
import { RecipeView } from "./RecipeView";

export function generateStaticParams() {
  return recipes.map((r) => ({ id: r.slug }));
}

export default async function PrototypeRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = getRecipeDetail(id);
  if (!recipe) notFound();
  return <RecipeView recipe={recipe} />;
}
