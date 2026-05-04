"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Banner, Button, TextField } from "@cuckoobook/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }
    router.push("/recipes");
    router.refresh();
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-16">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        cuckoobook is invite-only — sign in with your existing account.
      </p>
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
        <TextField
          type="email"
          name="email"
          autoComplete="email"
          required
          autoFocus
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          size="full"
        />
        <TextField
          type="password"
          name="password"
          autoComplete="current-password"
          required
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          size="full"
        />
        <Button type="submit" loading={status === "submitting"} fullWidth>
          Sign in
        </Button>
      </form>
      {status === "error" && error && (
        <Banner
          variant="error"
          heading="Could not sign in"
          body={error}
          dismissible={false}
        />
      )}
    </main>
  );
}
