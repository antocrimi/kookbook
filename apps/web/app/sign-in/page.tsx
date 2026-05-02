"use client";

import { useState } from "react";
import { Banner, Button, TextField } from "@cuckoobook/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/recipes`,
      },
    });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-16">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        We&apos;ll email you a magic link.
      </p>
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
        <TextField
          type="email"
          required
          autoFocus
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          size="full"
        />
        <Button type="submit" loading={status === "sending"} fullWidth>
          Send magic link
        </Button>
      </form>
      {status === "sent" && (
        <Banner
          variant="success"
          heading={`Check your inbox at ${email}`}
          body={
            <>
              In local dev, view it at{" "}
              <a
                className="underline"
                href="http://127.0.0.1:54524"
                target="_blank"
                rel="noreferrer"
              >
                127.0.0.1:54524
              </a>
              .
            </>
          }
          dismissible={false}
        />
      )}
      {status === "error" && error && (
        <Banner variant="error" heading="Could not send magic link" body={error} dismissible={false} />
      )}
    </main>
  );
}
