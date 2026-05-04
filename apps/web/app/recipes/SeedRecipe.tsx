"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@cuckoobook/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const LEMONY_ORZO = {
  title: "Lemony Orzo With Asparagus and Garlic Bread Crumbs",
  source: "NYT Cooking",
  default_servings: 4,
  ingredients: [
    { raw: "Salt and black pepper", item: "salt and black pepper" },
    { raw: "1 cup orzo", item: "orzo", quantity: { value: 1, unit: "cup" } },
    {
      raw: "1 pound asparagus, trimmed and thinly sliced on a diagonal (about ¼-inch thick)",
      item: "asparagus, trimmed and thinly sliced on a diagonal",
      quantity: { value: 1, unit: "lb" },
      note: "about ¼-inch thick",
    },
    {
      raw: "5 tablespoons extra-virgin olive oil",
      item: "extra-virgin olive oil",
      quantity: { value: 5, unit: "tbsp" },
    },
    {
      raw: "1 teaspoon lemon zest plus 3 tablespoons lemon juice, plus more as needed (from about 1 large lemon)",
      item: "lemon zest and juice",
      quantity: { value: 1, unit: "tsp" },
      note: "plus 3 tbsp juice, from about 1 large lemon",
    },
    {
      raw: "½ cup panko or homemade bread crumbs",
      item: "panko or homemade bread crumbs",
      quantity: { value: 0.5, unit: "cup" },
    },
    {
      raw: "1 small garlic clove, finely grated",
      item: "garlic clove, finely grated",
      quantity: { value: 1, unit: "clove" },
    },
    {
      raw: "¼ cup finely grated Parmesan, plus more for serving",
      item: "finely grated Parmesan",
      quantity: { value: 0.25, unit: "cup" },
      note: "plus more for serving",
    },
    {
      raw: "½ cup fresh dill, mint or parsley leaves (or any combination), torn if large",
      item: "fresh herbs (dill, mint or parsley)",
      quantity: { value: 0.5, unit: "cup" },
      note: "or any combination, torn if large",
    },
  ],
  steps: [
    {
      text: "Bring a medium pot of salted water to a boil. Add the orzo and cook until al dente according to package directions. Two minutes before the orzo is done, add the asparagus. Drain the orzo and asparagus. Wipe out and reserve the pot.",
    },
    {
      text: "While the orzo and asparagus cook, make the dressing: In a large bowl, stir together 3 tablespoons oil and the lemon zest and juice; season to taste with salt and pepper. Add the drained orzo and asparagus and toss to coat. Set aside while you toast the bread crumbs.",
    },
    {
      text: "In the reserved pot, heat the remaining 2 tablespoons oil over medium. Add the panko and cook, stirring, until golden brown, 3 to 5 minutes. Remove from heat, then stir in the garlic and season with salt and pepper.",
    },
    {
      text: "Stir the Parmesan and herbs into the orzo, taste, then season with salt, pepper and additional lemon juice, if desired. Top with the toasted bread crumbs and more Parmesan if you like. Serve warm or at room temperature.",
    },
  ],
};

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
    const { error: insertError } = await supabase
      .from("recipes")
      .insert({ folder_id: folder.id, ...LEMONY_ORZO });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button size="xs" variant="ghost" onClick={seed} loading={pending}>
        Seed demo recipe
      </Button>
      {error && <p className="text-xs text-coral">{error}</p>}
    </div>
  );
}
