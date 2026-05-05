export type Unit =
  | "tsp" | "tbsp" | "floz" | "cup" | "pint" | "quart" | "gallon" | "ml" | "l"
  | "oz" | "lb" | "g" | "kg"
  | "whole" | "clove" | "pinch" | "dash" | "slice"
  | "inch" | "cm"
  | "f" | "c";

export type Quantity = { value: number; unit: Unit };
export type QuantityRange = { low: number; high: number; unit: Unit };

export type Ingredient = {
  raw: string;
  quantity?: Quantity;
  range?: QuantityRange;
  item: string;
  note?: string;
  group?: string;
};

export type Step = {
  text: string;
  group?: string;
};

export type Recipe = {
  id: string;
  user_id: string;
  folder_id: string;
  title: string;
  source?: string | null;
  description?: string | null;
  notes?: string | null;
  default_servings: number;
  time_min?: number | null;
  ingredients: Ingredient[];
  steps: Step[];
  original_photo_path?: string | null;
  extracted_at?: string | null;
  extraction_model?: string | null;
  created_at: string;
  updated_at: string;
};

export type Folder = {
  id: string;
  user_id: string;
  name: string;
  is_inbox: boolean;
  created_at: string;
};
