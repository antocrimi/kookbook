import Link from "next/link";
import { Button } from "@cuckoobook/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-16">
      <h1 className="text-3xl font-semibold tracking-tight">cuckoobook</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Personal recipe collection. Capture · Scale · Convert.
      </p>
      {user ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-zinc-500">Signed in as {user.email}</p>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/recipes">My recipes</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/test-extract">Test extract</Link>
            </Button>
          </div>
        </div>
      ) : (
        <Button asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      )}
    </main>
  );
}
