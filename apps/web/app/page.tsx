"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@cuckoobook/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function Home() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-16">
      <h1 className="text-3xl font-semibold tracking-tight">cuckoobook</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Personal recipe collection. Capture · Scale · Convert.
      </p>
      {email === undefined ? null : email ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-zinc-500">Signed in as {email}</p>
          <Button asChild variant="outline">
            <Link href="/recipes">My recipes</Link>
          </Button>
        </div>
      ) : (
        <Button asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      )}
    </main>
  );
}
