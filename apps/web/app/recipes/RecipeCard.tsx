"use client";

/* eslint-disable @next/next/no-img-element -- prototype design uses raw <img>; original_photo_path can be a path-style fixture URL or a Supabase Storage public URL, both work. */
import Link from "next/link";

interface RecipeCardProps {
  id: string;
  title: string;
  timeMin: number | null;
  photoUrl: string | null;
}

export function RecipeCard({ id, title, timeMin, photoUrl }: RecipeCardProps) {
  return (
    <Link href={`/recipe?id=${id}`} className="r-card">
      {photoUrl ? (
        <img src={photoUrl} alt={title} className="r-card-photo" />
      ) : (
        <div className="r-card-photo" />
      )}
      <div className="r-card-info">
        <div className="r-card-title">{title}</div>
        {timeMin != null && <div className="r-card-time">{timeMin} MIN</div>}
      </div>
    </Link>
  );
}
