export type Ingredient = {
  qty: number | null;
  unit: "tsp" | "tbsp" | "cup" | "floz" | "pint" | "quart" | "oz" | "lb" | "clove" | null;
  type: "volume" | "weight" | "count" | "none";
  text: string;
};

export type RecipeSummary = {
  slug: string;
  title: string;
  photo: string;
  timeMin: number;
};

export type RecipeDetail = RecipeSummary & {
  defaultServings: number;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
};

export const recipes: RecipeSummary[] = [
  {
    slug: "lemony-orzo",
    title: "Lemony Orzo with Asparagus and Garlic…",
    photo: "/prototype/assets/AS-Lemony-Orzo-with-Asparagus-pgmk-threeByTwoMediumAt2X.jpg.webp",
    timeMin: 20,
  },
  {
    slug: "burgoo",
    title: "Burgoo",
    photo: "/prototype/assets/KD-burgoo-hqwf-threeByTwoMediumAt2X.jpg.webp",
    timeMin: 20,
  },
  {
    slug: "crispy-gnocchi",
    title: "Crispy Gnocchi With Burst Tomatoes and…",
    photo: "/prototype/assets/as-cheesy-baked-gnocchi-threeByTwoMediumAt2X-v2.jpg.webp",
    timeMin: 20,
  },
  {
    slug: "zucchini-pancakes",
    title: "Zucchini Pancakes",
    photo: "/prototype/assets/el-zucchini-pancakes-threeByTwoMediumAt2X-v4.jpg",
    timeMin: 30,
  },
  {
    slug: "rhubarb-macaroon-tart",
    title: "Rhubarb Macaroon Tart",
    photo: "/prototype/assets/SS-Rhubarb-Macaroon-Tart-wvbc-threeByTwoMediumAt2X.jpg.webp",
    timeMin: 20,
  },
  {
    slug: "sheet-pan-feta",
    title: "Sheet-Pan Feta With Chickpeas and…",
    photo: "/prototype/assets/merlin_209335479_52115ec4-9a9b-483e-b749-ed40dc44a69d-threeByTwoMediumAt2X.jpg.webp",
    timeMin: 40,
  },
  {
    slug: "lemon-butter-salmon",
    title: "Lemon Butter Salmon With Dill",
    photo: "/prototype/assets/15FD-KO-EASTERREX-GK-Honey-Lemon-Salmon-kcht-threeByTwoMediumAt2X-v2.jpg.webp",
    timeMin: 20,
  },
  {
    slug: "spiced-pea-stew",
    title: "Spiced Pea Stew With Yogurt",
    photo: "/prototype/assets/16EATrex-pea-stew-qcbp-threeByTwoMediumAt2X.jpg.webp",
    timeMin: 20,
  },
];

const lemonyOrzo: RecipeDetail = {
  slug: "lemony-orzo",
  title: "Lemony Orzo with Asparagus and Garlic Bread Crumbs",
  photo: "/prototype/assets/AS-Lemony-Orzo-with-Asparagus-pgmk-threeByTwoMediumAt2X.jpg.webp",
  timeMin: 20,
  defaultServings: 4,
  description:
    "Every spoonful of this pasta has a happy jumble of lemony orzo, grassy asparagus, garlicky bread crumbs, fresh herbs and salty Parmesan. The pasta and thinly sliced asparagus cook together in the same pot, then rest in a lemony dressing while the garlic bread crumbs are toasted, so the pasta has time to absorb as much flavor as possible.",
  ingredients: [
    { qty: null, unit: null, type: "none", text: "Salt and black pepper" },
    { qty: 1, unit: "cup", type: "volume", text: "orzo" },
    {
      qty: 1,
      unit: "lb",
      type: "weight",
      text: "asparagus, trimmed and thinly sliced on a diagonal (about ¼-inch thick)",
    },
    { qty: 5, unit: "tbsp", type: "volume", text: "extra-virgin olive oil" },
    {
      qty: 1,
      unit: "tsp",
      type: "volume",
      text: "lemon zest, plus 3 tbsp lemon juice (from about 1 large lemon)",
    },
    { qty: 0.5, unit: "cup", type: "volume", text: "panko or homemade bread crumbs" },
    { qty: 1, unit: "clove", type: "count", text: "garlic, finely grated" },
    {
      qty: 0.25,
      unit: "cup",
      type: "volume",
      text: "finely grated Parmesan, plus more for serving",
    },
    {
      qty: 0.5,
      unit: "cup",
      type: "volume",
      text: "fresh dill, mint or parsley (or any combination), torn if large",
    },
  ],
  steps: [
    "Bring a medium pot of salted water to a boil. Add the orzo and cook until al dente according to package directions. Two minutes before the orzo is done, add the asparagus. Drain the orzo and asparagus. Wipe out and reserve the pot.",
    "While the orzo and asparagus cook, make the dressing: In a large bowl, stir together 3 tablespoons oil and the lemon zest and juice; season to taste with salt and pepper. Add the drained orzo and asparagus and toss to coat. Set aside while you toast the bread crumbs.",
    "In the reserved pot, heat the remaining 2 tablespoons oil over medium. Add the panko and cook, stirring, until golden brown, 3 to 5 minutes. Remove from heat, then stir in the garlic and season with salt and pepper.",
    "Stir the Parmesan and herbs into the orzo, taste, then season with salt, pepper and additional lemon juice, if desired. Top with the toasted bread crumbs and more Parmesan if you like. Serve warm or at room temperature.",
  ],
};

const recipeDetails: Record<string, RecipeDetail> = {
  "lemony-orzo": lemonyOrzo,
};

export function getRecipeDetail(slug: string): RecipeDetail | null {
  return recipeDetails[slug] ?? null;
}

export function getRecipeSummary(slug: string): RecipeSummary | null {
  return recipes.find((r) => r.slug === slug) ?? null;
}
