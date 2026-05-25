"use client";

/* eslint-disable @next/next/no-img-element -- prototype-style raw <img>. */
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type DraftRow = {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
  original_photo_path: string | null;
  ingredients: unknown[];
  steps: unknown[];
  photoUrl: string | null;
};

function resolvePhotoUrl(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  path: string | null,
): string | null {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return supabase.storage.from("recipe-photos").getPublicUrl(path).data.publicUrl;
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, updated_at, created_at, original_photo_path, ingredients, steps")
        .eq("is_draft", true)
        .order("updated_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setDrafts([]);
        return;
      }
      const enriched = (data ?? []).map((r) => ({
        ...r,
        ingredients: (r.ingredients ?? []) as unknown[],
        steps: (r.steps ?? []) as unknown[],
        photoUrl: resolvePhotoUrl(supabase, r.original_photo_path),
      }));
      setDrafts(enriched);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="recipe-app">
      <div className="page" id="drafts">
        <header className="home-header">
          <Link href="/recipes" className="menu-btn" aria-label="Back to recipes" style={{ alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <span className="saved-title" style={{ fontSize: 18 }}>Drafts</span>
          <span style={{ width: 44 }} aria-hidden />
        </header>

        <div className="saved-section">
          <hr className="saved-divider" />
        </div>

        {error && (
          <div className="recipes-error">Couldn&apos;t load drafts — {error}</div>
        )}

        {drafts === null ? null : drafts.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-heading">No drafts in progress.</h2>
            <p className="empty-body">
              When extraction succeeds, the recipe lands here as a draft until you save it.
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: "0 16px", margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {drafts.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/capture?draftId=${d.id}`}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 12,
                    border: "1px solid var(--recipe-line)",
                    borderRadius: 8,
                    textDecoration: "none",
                    color: "inherit",
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      width: 90,
                      aspectRatio: "3 / 2",
                      flexShrink: 0,
                      borderRadius: 6,
                      background: "#d4c8b4",
                      overflow: "hidden",
                    }}
                  >
                    {d.photoUrl && (
                      <img src={d.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {d.title.trim() || "(untitled)"}
                    </div>
                    <div className="text-xs text-stone">
                      {d.ingredients.length} ingredients · {d.steps.length} steps · {formatRelative(d.updated_at)}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
