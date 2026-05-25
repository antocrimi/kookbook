"use client";

/* eslint-disable @next/next/no-img-element -- prototype-style raw <img>; data URLs and storage URLs both work. */
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Banner, Button } from "@cuckoobook/ui";
import { compressImage } from "@/lib/imageCompress";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Ingredient, Step } from "@/lib/types";
import { ConfirmForm, type ExtractedRecipe } from "./ConfirmForm";

const MAX_PHOTOS = 4;
const RECIPE_PHOTOS_BUCKET = "recipe-photos";

type Photo = {
  id: string;
  file: File;
  previewUrl: string;
  storagePath?: string;
};

type ExtractResult = {
  ok?: boolean;
  error?: string;
  model?: string;
  duration_ms?: number;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_read_tokens: number;
    cache_creation_tokens: number;
  };
  recipe?: ExtractedRecipe;
};

type Phase =
  | "loading-draft"
  | "picking"
  | "uploading"
  | "extracting"
  | "confirming"
  | "error";

function deriveDraftPrefix(path: string | null | undefined): string | null {
  if (!path) return null;
  const m = path.match(/^(.+\/captures\/[^/]+)\//);
  return m ? `${m[1]}/` : null;
}

async function listDraftPhotoPaths(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  prefix: string,
): Promise<string[]> {
  const { data } = await supabase.storage.from(RECIPE_PHOTOS_BUCKET).list(prefix);
  if (!data) return [];
  return data
    .filter((entry) => entry.name && !entry.name.endsWith("/"))
    .map((entry) => `${prefix}${entry.name}`)
    .sort();
}

export default function CapturePage() {
  return (
    <Suspense fallback={null}>
      <CaptureBody />
    </Suspense>
  );
}

function CaptureBody() {
  const params = useSearchParams();
  const draftIdParam = params.get("draftId");

  const [userId, setUserId] = useState<string | null>(null);
  const [draftFolder] = useState<string>(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `draft-${Date.now()}`,
  );
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [phase, setPhase] = useState<Phase>(draftIdParam ? "loading-draft" : "picking");
  const [uploadedPaths, setUploadedPaths] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedRecipe | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Resume: fetch draft and skip straight to the confirm form.
  useEffect(() => {
    if (!draftIdParam) return;
    let cancelled = false;
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", draftIdParam)
        .eq("is_draft", true)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setError(error?.message ?? "Draft not found.");
        setPhase("error");
        return;
      }
      const prefix = deriveDraftPrefix(data.original_photo_path);
      const paths = prefix ? await listDraftPhotoPaths(supabase, prefix) : [];
      setRecipeId(data.id);
      setUploadedPaths(paths);
      setExtracted({
        title: data.title ?? "",
        source: data.source ?? "",
        description: data.description ?? "",
        default_servings: data.default_servings ?? 4,
        time_min: data.time_min ?? undefined,
        ingredients: (data.ingredients ?? []) as Ingredient[],
        steps: (data.steps ?? []) as Step[],
        notes: data.notes ?? "",
      });
      setPhase("confirming");
    })();
    return () => {
      cancelled = true;
    };
  }, [draftIdParam]);

  function onFilesChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    setPhase("picking");
    setResult(null);
    setPhotos((prev) => {
      const remaining = MAX_PHOTOS - prev.length;
      const accepted = files.slice(0, Math.max(0, remaining));
      const next = accepted.map<Photo>((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...next];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function uploadAllPhotos(uid: string): Promise<string[]> {
    const supabase = createSupabaseBrowserClient();
    const paths: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const compressed = await compressImage(photo.file);
      const path = `${uid}/captures/${draftFolder}/${i}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from(RECIPE_PHOTOS_BUCKET)
        .upload(path, compressed, { contentType: "image/jpeg", upsert: true });
      if (uploadErr) throw new Error(`upload ${i}: ${uploadErr.message}`);
      paths.push(path);
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, storagePath: path } : p)),
      );
    }
    return paths;
  }

  async function createDraft(
    uid: string,
    paths: string[],
    extractedRecipe: ExtractedRecipe | null,
  ): Promise<string | null> {
    const supabase = createSupabaseBrowserClient();
    const { data: inbox } = await supabase
      .from("folders")
      .select("id")
      .eq("is_inbox", true)
      .single();
    if (!inbox) {
      throw new Error("Inbox folder missing for current user.");
    }
    const insertPayload = {
      user_id: uid,
      folder_id: inbox.id,
      is_draft: true,
      title: extractedRecipe?.title?.trim() || "(untitled)",
      source: extractedRecipe?.source ?? null,
      description: extractedRecipe?.description ?? null,
      default_servings: extractedRecipe?.default_servings ?? 4,
      time_min: extractedRecipe?.time_min ?? null,
      ingredients: extractedRecipe?.ingredients ?? [],
      steps: extractedRecipe?.steps ?? [],
      notes: extractedRecipe?.notes ?? null,
      original_photo_path: paths[0] ?? null,
      extracted_at: extractedRecipe ? new Date().toISOString() : null,
    };
    const { data, error } = await supabase
      .from("recipes")
      .insert(insertPayload)
      .select("id")
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? "Couldn't create draft.");
    }
    return data.id;
  }

  async function onSubmit() {
    if (!userId) {
      setError("Not signed in.");
      setPhase("error");
      return;
    }
    if (photos.length === 0) {
      setError("Add at least one photo.");
      setPhase("error");
      return;
    }

    setError(null);
    setResult(null);
    setPhase("uploading");

    let paths: string[];
    try {
      paths = await uploadAllPhotos(userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
      return;
    }

    setPhase("extracting");
    const supabase = createSupabaseBrowserClient();
    const { data, error: invokeErr } = await supabase.functions.invoke<ExtractResult>(
      "extract",
      { body: { mode: "extract", photo_paths: paths } },
    );

    if (invokeErr) {
      setUploadedPaths(paths);
      setError(`Extraction request failed: ${invokeErr.message}`);
      setPhase("error");
      return;
    }
    if (!data?.ok || !data.recipe) {
      setUploadedPaths(paths);
      setError(data?.error ?? "Extraction failed.");
      setResult(data);
      setPhase("error");
      return;
    }

    let newRecipeId: string | null = null;
    try {
      newRecipeId = await createDraft(userId, paths, data.recipe);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
      return;
    }

    setResult(data);
    setUploadedPaths(paths);
    setRecipeId(newRecipeId);
    setExtracted(data.recipe);
    setPhase("confirming");
  }

  async function startManualEntry() {
    if (!userId) return;
    let paths = uploadedPaths;
    if (paths.length === 0) {
      try {
        paths = await uploadAllPhotos(userId);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setPhase("error");
        return;
      }
    }
    let newRecipeId: string | null;
    try {
      newRecipeId = await createDraft(userId, paths, null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
      return;
    }
    setUploadedPaths(paths);
    setRecipeId(newRecipeId);
    setExtracted({ title: "", default_servings: 4, ingredients: [], steps: [] });
    setPhase("confirming");
  }

  function reset() {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
    setResult(null);
    setError(null);
    setUploadedPaths([]);
    setRecipeId(null);
    setExtracted(null);
    setPhase("picking");
  }

  const submitDisabled =
    photos.length === 0 || phase === "uploading" || phase === "extracting";

  return (
    <div className="recipe-app">
      <div className="page" id="capture">
        <header className="home-header">
          <Link href="/recipes" className="menu-btn" aria-label="Back to recipes" style={{ alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <span className="saved-title" style={{ fontSize: 18 }}>
            {draftIdParam ? "Resume draft" : "Capture"}
          </span>
          <span style={{ width: 44 }} aria-hidden />
        </header>

        <main className="recipe-content" style={{ paddingBottom: 120 }}>
          {phase === "loading-draft" && (
            <p className="recipe-desc">Loading draft…</p>
          )}

          {!draftIdParam && phase !== "confirming" && (
            <p className="recipe-desc" style={{ marginBottom: 24 }}>
              Up to {MAX_PHOTOS} photos per recipe. We&apos;ll downscale on your device, send to your Anthropic key, and show what comes back.
            </p>
          )}

          {!draftIdParam && phase !== "confirming" && photos.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {photos.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    position: "relative",
                    aspectRatio: "3 / 2",
                    overflow: "hidden",
                    borderRadius: 8,
                    background: "#d4c8b4",
                  }}
                >
                  <img
                    src={p.previewUrl}
                    alt={`photo ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  {phase === "picking" && (
                    <button
                      type="button"
                      onClick={() => removePhoto(p.id)}
                      aria-label={`remove photo ${i + 1}`}
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        lineHeight: 1,
                        padding: 0,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!draftIdParam && phase !== "confirming" && photos.length < MAX_PHOTOS && phase === "picking" && (
            <div style={{ marginBottom: 24 }}>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                fullWidth
              >
                {photos.length === 0 ? "Add photo" : `Add another (${photos.length}/${MAX_PHOTOS})`}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={onFilesChosen}
                style={{ display: "none" }}
              />
            </div>
          )}

          {!draftIdParam && phase !== "confirming" && phase !== "error" && (
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <Button
                onClick={onSubmit}
                disabled={submitDisabled}
                loading={phase === "uploading" || phase === "extracting"}
                fullWidth
              >
                {phase === "uploading"
                  ? "Uploading photos…"
                  : phase === "extracting"
                  ? "Extracting recipe…"
                  : `Extract recipe (${photos.length} photo${photos.length === 1 ? "" : "s"})`}
              </Button>
            </div>
          )}

          {phase === "error" && error && (
            <>
              <Banner
                variant="error"
                heading="Capture failed"
                body={error}
                dismissible={false}
              />
              {!draftIdParam && (
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <Button onClick={startManualEntry} variant="outline">
                    Edit manually
                  </Button>
                  <Button onClick={reset} variant="ghost">
                    Start over
                  </Button>
                </div>
              )}
            </>
          )}

          {phase === "confirming" && extracted && recipeId && (
            <>
              {result && (
                <Banner
                  variant="success"
                  heading={`Extracted in ${((result.duration_ms ?? 0) / 1000).toFixed(1)}s`}
                  body={`Model: ${result.model}. Tokens — input ${result.usage?.input_tokens ?? "?"} / output ${result.usage?.output_tokens ?? "?"}${result.usage?.cache_read_tokens ? ` · cache hit ${result.usage.cache_read_tokens}` : ""}.`}
                  dismissible={false}
                />
              )}
              <div style={{ marginTop: result ? 24 : 0 }}>
                <ConfirmForm
                  recipeId={recipeId}
                  extracted={extracted}
                  photoPaths={uploadedPaths}
                  onCancel={reset}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
