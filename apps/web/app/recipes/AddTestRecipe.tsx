"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Banner, Button } from "@cuckoobook/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AddTestRecipe() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { data: folder } = await supabase
      .from("folders")
      .select("id")
      .eq("is_inbox", true)
      .single();
    if (!folder) {
      setError("No Inbox folder found for user (signup trigger may not have fired)");
      return;
    }
    const { error } = await supabase.from("recipes").insert({
      folder_id: folder.id,
      title: `Test recipe ${new Date().toLocaleTimeString()}`,
      default_servings: 4,
      ingredients: [
        { raw: "2 cups flour", item: "flour", quantity: { value: 2, unit: "cup" } },
      ],
      steps: [{ text: "Mix and bake." }],
    });
    if (error) {
      setError(error.message);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button size="sm" variant="outline" onClick={add} loading={pending}>
        Add test recipe
      </Button>
      {error && <Banner variant="error" heading="Couldn't add recipe" body={error} />}
    </div>
  );
}
