"use client";

/* eslint-disable @next/next/no-img-element -- prototype-style raw <img>; data URLs and storage URLs both work. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Banner, Button } from "@cuckoobook/ui";
import { compressImage } from "@/lib/imageCompress";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

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
  recipe?: unknown;
};

export default function CapturePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [draftId] = useState<string>(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `draft-${Date.now()}`,
  );
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [phase, setPhase] = useState<
    "picking" | "uploading" | "extracting" | "done" | "error"
  >("picking");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

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

    const supabase = createSupabaseBrowserClient();
    const uploadedPaths: string[] = [];

    try {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const compressed = await compressImage(photo.file);
        const path = `${userId}/captures/${draftId}/${i}.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from(RECIPE_PHOTOS_BUCKET)
          .upload(path, compressed, {
            contentType: "image/jpeg",
            upsert: true,
          });
        if (uploadErr) throw new Error(`upload ${i}: ${uploadErr.message}`);
        uploadedPaths.push(path);
        setPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, storagePath: path } : p)),
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
      return;
    }

    setPhase("extracting");

    const { data, error: invokeErr } = await supabase.functions.invoke<ExtractResult>(
      "extract",
      { body: { mode: "extract", photo_paths: uploadedPaths } },
    );

    if (invokeErr) {
      setError(`Extraction request failed: ${invokeErr.message}`);
      setPhase("error");
      return;
    }
    if (!data?.ok) {
      setError(data?.error ?? "Extraction failed.");
      setPhase("error");
      setResult(data);
      return;
    }
    setResult(data);
    setPhase("done");
  }

  function reset() {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
    setResult(null);
    setError(null);
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
          <span className="saved-title" style={{ fontSize: 18 }}>Capture</span>
          <span style={{ width: 44 }} aria-hidden />
        </header>

        <main className="recipe-content" style={{ paddingBottom: 120 }}>
          <p className="recipe-desc" style={{ marginBottom: 24 }}>
            Up to {MAX_PHOTOS} photos per recipe. We&apos;ll downscale on your device, send to your Anthropic key, and show what comes back.
          </p>

          {photos.length > 0 && (
            <div
              className="ing-list"
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

          {photos.length < MAX_PHOTOS && phase === "picking" && (
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

          {phase === "error" && error && (
            <Banner
              variant="error"
              heading="Capture failed"
              body={error}
              dismissible={false}
            />
          )}

          {phase === "done" && result?.ok && (
            <>
              <Banner
                variant="success"
                heading={`Extracted in ${(result.duration_ms ?? 0) / 1000}s`}
                body={`Model: ${result.model}. Tokens — input: ${result.usage?.input_tokens ?? "?"}, output: ${result.usage?.output_tokens ?? "?"}, cache read: ${result.usage?.cache_read_tokens ?? 0}, cache creation: ${result.usage?.cache_creation_tokens ?? 0}.`}
                dismissible={false}
              />
              <pre
                style={{
                  marginTop: 24,
                  padding: 16,
                  background: "#fff",
                  border: "1px solid var(--recipe-line)",
                  borderRadius: 8,
                  fontSize: 12,
                  lineHeight: 1.4,
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {JSON.stringify(result.recipe, null, 2)}
              </pre>
              <div style={{ marginTop: 16 }}>
                <Button variant="ghost" onClick={reset}>Capture another</Button>
              </div>
              <p className="text-xs text-stone" style={{ marginTop: 24 }}>
                The proper confirm/edit form lands in PR D. For now this is a sanity check that the pipeline works.
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
