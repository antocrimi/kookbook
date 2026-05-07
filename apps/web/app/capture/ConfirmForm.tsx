"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Banner, Button, TextArea, TextField } from "@cuckoobook/ui";
import type { Ingredient, Step } from "@/lib/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type ExtractedRecipe = {
  title?: string;
  source?: string;
  description?: string;
  default_servings?: number;
  time_min?: number;
  ingredients?: Ingredient[];
  steps?: Step[];
  notes?: string;
  confidence?: "high" | "medium" | "low" | "none";
};

type Folder = { id: string; name: string; is_inbox: boolean };

interface ConfirmFormProps {
  extracted: ExtractedRecipe;
  photoPaths: string[];
  onCancel: () => void;
}

type IngredientDraft = Ingredient & { uid: string };
type StepDraft = Step & { uid: string };

export function ConfirmForm({ extracted, photoPaths, onCancel }: ConfirmFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(extracted.title ?? "");
  const [source, setSource] = useState(extracted.source ?? "");
  const [description, setDescription] = useState(extracted.description ?? "");
  const [defaultServings, setDefaultServings] = useState<string>(
    extracted.default_servings ? String(extracted.default_servings) : "4",
  );
  const [timeMin, setTimeMin] = useState<string>(
    extracted.time_min ? String(extracted.time_min) : "",
  );
  const [notes, setNotes] = useState(extracted.notes ?? "");

  const [ingredients, setIngredients] = useState<IngredientDraft[]>(() =>
    (extracted.ingredients ?? []).map((ing) => ({ ...ing, uid: crypto.randomUUID() })),
  );
  const [steps, setSteps] = useState<StepDraft[]>(() =>
    (extracted.steps ?? []).map((s) => ({ ...s, uid: crypto.randomUUID() })),
  );

  const [folders, setFolders] = useState<Folder[] | null>(null);
  const [folderId, setFolderId] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("folders")
      .select("id, name, is_inbox")
      .order("is_inbox", { ascending: false })
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError(`Couldn't load folders: ${error.message}`);
          return;
        }
        const list = (data ?? []) as Folder[];
        setFolders(list);
        const inbox = list.find((f) => f.is_inbox) ?? list[0];
        if (inbox) setFolderId(inbox.id);
      });
  }, []);

  const updateIngredient = (uid: string, patch: Partial<Ingredient>) =>
    setIngredients((prev) => prev.map((ing) => (ing.uid === uid ? { ...ing, ...patch } : ing)));
  const removeIngredient = (uid: string) =>
    setIngredients((prev) => prev.filter((ing) => ing.uid !== uid));
  const addIngredient = () =>
    setIngredients((prev) => [
      ...prev,
      { uid: crypto.randomUUID(), raw: "", item: "" },
    ]);

  const updateStep = (uid: string, text: string) =>
    setSteps((prev) => prev.map((s) => (s.uid === uid ? { ...s, text } : s)));
  const removeStep = (uid: string) => setSteps((prev) => prev.filter((s) => s.uid !== uid));
  const addStep = () =>
    setSteps((prev) => [...prev, { uid: crypto.randomUUID(), text: "" }]);

  const ingredientsClean = useMemo<Ingredient[]>(
    () =>
      ingredients
        .filter((ing) => ing.raw.trim() || ing.item.trim())
        .map((ing): Ingredient => ({
          raw: ing.raw,
          item: ing.item,
          ...(ing.quantity ? { quantity: ing.quantity } : {}),
          ...(ing.range ? { range: ing.range } : {}),
          ...(ing.note ? { note: ing.note } : {}),
          ...(ing.group ? { group: ing.group } : {}),
        })),
    [ingredients],
  );
  const stepsClean = useMemo<Step[]>(
    () =>
      steps
        .filter((s) => s.text.trim())
        .map((s): Step => ({
          text: s.text,
          ...(s.group ? { group: s.group } : {}),
        })),
    [steps],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError("Title is required."); return; }
    const servings = parseInt(defaultServings, 10);
    if (!Number.isFinite(servings) || servings < 1) {
      setError("Default servings must be at least 1.");
      return;
    }
    if (!folderId) {
      setError("Pick a folder.");
      return;
    }
    if (ingredientsClean.length === 0) {
      setError("Add at least one ingredient.");
      return;
    }
    if (stepsClean.length === 0) {
      setError("Add at least one step.");
      return;
    }

    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error: insertErr } = await supabase
      .from("recipes")
      .insert({
        folder_id: folderId,
        title: title.trim(),
        source: source.trim() || null,
        description: description.trim() || null,
        default_servings: servings,
        time_min: timeMin.trim() ? parseInt(timeMin, 10) : null,
        ingredients: ingredientsClean,
        steps: stepsClean,
        notes: notes.trim() || null,
        original_photo_path: photoPaths[0] ?? null,
        extracted_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertErr || !data) {
      setError(`Couldn't save: ${insertErr?.message ?? "unknown error"}`);
      setSubmitting(false);
      return;
    }
    router.push(`/recipe?id=${data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {extracted.confidence && extracted.confidence !== "high" && (
        <Banner
          variant={extracted.confidence === "none" ? "error" : "warning"}
          heading={`Model confidence: ${extracted.confidence}`}
          body={
            extracted.confidence === "none"
              ? "The model couldn't recognize this as a recipe. Edit manually below or capture again."
              : "Worth a careful read-through before saving."
          }
          dismissible={false}
        />
      )}

      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        size="full"
      />
      <TextField
        label="Source"
        placeholder="NYT Cooking, Marcella Hazan, Mom…"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        size="full"
      />
      <TextArea
        label="Description"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        size="full"
      />
      <div className="flex gap-3">
        <TextField
          label="Default servings"
          type="number"
          inputMode="numeric"
          min={1}
          value={defaultServings}
          onChange={(e) => setDefaultServings(e.target.value)}
          required
        />
        <TextField
          label="Time (min)"
          type="number"
          inputMode="numeric"
          min={1}
          value={timeMin}
          onChange={(e) => setTimeMin(e.target.value)}
        />
      </div>

      <fieldset style={{ border: "1px solid var(--recipe-line)", borderRadius: 8, padding: 14 }}>
        <legend className="text-sm font-semibold" style={{ padding: "0 6px" }}>Ingredients</legend>
        <div className="flex flex-col gap-3" style={{ marginTop: 8 }}>
          {ingredients.map((ing, idx) => (
            <div key={ing.uid} className="flex flex-col gap-1">
              <div className="flex items-start gap-2">
                <TextField
                  label={idx === 0 ? "Raw text" : undefined}
                  placeholder='e.g., "1 cup all-purpose flour, sifted"'
                  value={ing.raw}
                  onChange={(e) => updateIngredient(ing.uid, { raw: e.target.value })}
                  size="full"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(ing.uid)}
                  aria-label="remove ingredient"
                  className="text-xs"
                  style={{
                    flexShrink: 0,
                    height: 38,
                    width: 38,
                    background: "none",
                    border: "1.5px solid var(--recipe-line)",
                    borderRadius: 8,
                    cursor: "pointer",
                    marginTop: idx === 0 ? 22 : 0,
                  }}
                >
                  ×
                </button>
              </div>
              {ing.quantity && (
                <p className="text-xs text-stone" style={{ marginLeft: 4 }}>
                  parsed: {ing.quantity.value} {ing.quantity.unit} · {ing.item}
                  {ing.note ? ` · ${ing.note}` : ""}
                  {ing.group ? ` · group: ${ing.group}` : ""}
                </p>
              )}
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={addIngredient}>
            + Add ingredient
          </Button>
        </div>
      </fieldset>

      <fieldset style={{ border: "1px solid var(--recipe-line)", borderRadius: 8, padding: 14 }}>
        <legend className="text-sm font-semibold" style={{ padding: "0 6px" }}>Steps</legend>
        <div className="flex flex-col gap-3" style={{ marginTop: 8 }}>
          {steps.map((s, idx) => (
            <div key={s.uid} className="flex items-start gap-2">
              <span className="text-xs text-stone" style={{ minWidth: 20, paddingTop: 12 }}>{idx + 1}.</span>
              <TextArea
                rows={2}
                value={s.text}
                onChange={(e) => updateStep(s.uid, e.target.value)}
                size="full"
              />
              <button
                type="button"
                onClick={() => removeStep(s.uid)}
                aria-label="remove step"
                className="text-xs"
                style={{
                  flexShrink: 0,
                  height: 38,
                  width: 38,
                  background: "none",
                  border: "1.5px solid var(--recipe-line)",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={addStep}>
            + Add step
          </Button>
        </div>
      </fieldset>

      <TextArea
        label="Notes"
        placeholder="Personal notes, substitutions, results…"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        size="full"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="folder-select" className="text-sm font-semibold">Folder</label>
        <select
          id="folder-select"
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
          required
          style={{
            height: 40,
            padding: "0 12px",
            border: "1.5px solid var(--recipe-line)",
            borderRadius: 8,
            background: "#fff",
            font: "inherit",
          }}
        >
          {folders === null && <option value="">Loading…</option>}
          {folders?.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}{f.is_inbox ? " (default)" : ""}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <Banner
          variant="error"
          heading="Couldn't save recipe"
          body={error}
          dismissible={false}
        />
      )}

      <div className="flex gap-2">
        <Button type="submit" loading={submitting}>
          {submitting ? "Saving…" : "Save recipe"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Discard
        </Button>
      </div>
    </form>
  );
}
