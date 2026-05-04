"use client";

import { useState } from "react";
import { Banner, Button, TextField } from "@cuckoobook/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const MIN_LENGTH = 6;

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters.`);
      setStatus("error");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }
    setPassword("");
    setConfirm("");
    setStatus("success");
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <TextField
        type="password"
        name="new-password"
        autoComplete="new-password"
        required
        label="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        size="full"
      />
      <TextField
        type="password"
        name="confirm-password"
        autoComplete="new-password"
        required
        label="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        size="full"
      />
      <Button type="submit" loading={status === "submitting"}>
        Update password
      </Button>
      {status === "success" && (
        <Banner
          variant="success"
          heading="Password updated"
          body="Use your new password next time you sign in."
          dismissible={false}
        />
      )}
      {status === "error" && error && (
        <Banner
          variant="error"
          heading="Could not update password"
          body={error}
          dismissible={false}
        />
      )}
    </form>
  );
}
