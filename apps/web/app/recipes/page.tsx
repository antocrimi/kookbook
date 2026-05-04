import Link from "next/link";
import { redirect } from "next/navigation";
import { Banner, Button } from "@cuckoobook/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RecipeCard } from "./RecipeCard";
import { SeedRecipe } from "./SeedRecipe";
import { SignOut } from "./SignOut";
import styles from "./page.module.scss";

export default async function RecipesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, default_servings, updated_at, original_photo_path")
    .order("updated_at", { ascending: false });

  const recipesWithPhotos = (recipes ?? []).map((r) => ({
    ...r,
    photoUrl: r.original_photo_path
      ? supabase.storage.from("recipe-photos").getPublicUrl(r.original_photo_path).data.publicUrl
      : null,
  }));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.wordmark}>cuckoobook</h1>
        <div className={styles.headerRight}>
          <Button asChild size="sm">
            <Link href="/capture">+ Capture</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/settings">Settings</Link>
          </Button>
          <SignOut />
        </div>
      </header>

      <main className={styles.main}>
        {error && (
          <Banner variant="error" heading="Couldn't load recipes" body={error.message} />
        )}

        {recipesWithPhotos.length > 0 ? (
          <>
            <div className={styles.toolbar}>
              <span className={styles.count}>
                {recipesWithPhotos.length} recipe{recipesWithPhotos.length !== 1 ? "s" : ""}
              </span>
              <SeedRecipe />
            </div>
            <div className={styles.grid}>
              {recipesWithPhotos.map((r) => (
                <RecipeCard
                  key={r.id}
                  id={r.id}
                  title={r.title}
                  servings={r.default_servings}
                  photoUrl={r.photoUrl}
                />
              ))}
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <h2 className={styles.emptyHeading}>Your recipe collection starts here.</h2>
            <p className={styles.emptyBody}>
              Snap a photo of a cookbook page and let AI extract the recipe. Or seed a demo recipe to explore the design.
            </p>
            <div className={styles.emptyActions}>
              <Button asChild size="lg">
                <Link href="/capture">Capture a recipe</Link>
              </Button>
              <SeedRecipe />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
