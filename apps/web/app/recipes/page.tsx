import Link from "next/link";
import { redirect } from "next/navigation";
import { Banner, Button } from "@cuckoobook/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AddTestRecipe } from "./AddTestRecipe";
import { SignOut } from "./SignOut";

export default async function RecipesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, default_servings, created_at, folder_id")
    .order("updated_at", { ascending: false });

  const { data: folders } = await supabase
    .from("folders")
    .select("id, name, is_inbox");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Recipes</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-zinc-500">{user.email}</span>
          <SignOut />
        </div>
      </header>

      <section className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-sm font-medium">Folders</h2>
        <ul className="text-sm text-zinc-600 dark:text-zinc-400">
          {folders?.map((f) => (
            <li key={f.id}>
              {f.name}
              {f.is_inbox && (
                <span className="ml-2 text-xs text-zinc-400">(default)</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Your recipes</h2>
          <AddTestRecipe />
        </div>
        {error && (
          <Banner variant="error" heading="Couldn't load recipes" body={error.message} />
        )}
        {recipes && recipes.length > 0 ? (
          <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {recipes.map((r) => (
              <li key={r.id} className="px-4 py-3">
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-zinc-500">
                  {r.default_servings} servings ·{" "}
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">
            No recipes yet. Click &quot;Add test recipe&quot; to insert one
            (verifies auth + RLS + write).
          </p>
        )}
      </section>

      <Button asChild variant="ghost" size="sm" className="self-start">
        <Link href="/test-extract">→ Test the Anthropic extract route</Link>
      </Button>
    </main>
  );
}
