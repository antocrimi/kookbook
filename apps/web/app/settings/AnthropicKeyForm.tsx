"use client";

import { useEffect, useState } from "react";
import { Banner, Button, TextField } from "@cuckoobook/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Status =
  | { kind: "loading" }
  | { kind: "absent" }
  | { kind: "set"; lastValidatedAt: string | null };

type FormState = "idle" | "submitting" | "success" | "error";

function formatRelative(iso: string | null): string {
  if (!iso) return "never validated";
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.round(ms / 1000);
  if (s < 60) return `validated ${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `validated ${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `validated ${h}h ago`;
  const d = Math.round(h / 24);
  return `validated ${d}d ago`;
}

export function AnthropicKeyForm() {
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [editing, setEditing] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("user_api_keys")
      .select("last_validated_at")
      .eq("provider", "anthropic")
      .maybeSingle();
    if (error) {
      setStatus({ kind: "absent" });
      return;
    }
    if (!data) {
      setStatus({ kind: "absent" });
      return;
    }
    setStatus({ kind: "set", lastValidatedAt: data.last_validated_at });
    setEditing(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!keyInput.trim()) {
      setError("Paste your Anthropic API key.");
      setFormState("error");
      return;
    }

    setFormState("submitting");
    const supabase = createSupabaseBrowserClient();

    const { error: setErr } = await supabase.rpc("set_user_api_key", {
      provider_in: "anthropic",
      plaintext_key: keyInput.trim(),
    });
    if (setErr) {
      setError(`Couldn't save key: ${setErr.message}`);
      setFormState("error");
      return;
    }

    const { data: validateRes, error: invokeErr } = await supabase.functions.invoke<{
      ok?: boolean;
      error?: string;
      validated_at?: string;
    }>("extract", {
      body: { mode: "validate" },
    });

    if (invokeErr) {
      setError(`Saved, but validation request failed: ${invokeErr.message}`);
      setFormState("error");
      return;
    }
    if (!validateRes?.ok) {
      setError(validateRes?.error ?? "Validation failed.");
      setFormState("error");
      return;
    }

    setKeyInput("");
    setFormState("success");
    await refresh();
  }

  if (status.kind === "loading") {
    return null;
  }

  const showForm = status.kind === "absent" || editing;

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      {status.kind === "set" && !editing && (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-stone">
            <span className="font-mono">●●●●●●●●</span>{" "}
            <span>{formatRelative(status.lastValidatedAt)}</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Replace
          </Button>
        </div>
      )}

      {showForm && (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <TextField
            type="password"
            name="anthropic-api-key"
            autoComplete="off"
            label="Anthropic API key"
            placeholder="sk-ant-..."
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            size="full"
          />
          <p className="text-xs text-stone">
            Paste a key from{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              console.anthropic.com
            </a>
            . Stored encrypted in Supabase Vault. Only the Edge Function ever sees the plaintext.
          </p>
          <div className="flex items-center gap-2">
            <Button type="submit" loading={formState === "submitting"}>
              {formState === "submitting" ? "Validating…" : "Validate & save"}
            </Button>
            {status.kind === "set" && (
              <Button type="button" variant="ghost" onClick={() => { setEditing(false); setKeyInput(""); setError(null); setFormState("idle"); }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {formState === "success" && (
        <Banner
          variant="success"
          heading="Key validated"
          body="Anthropic accepted the key. You're ready to capture recipes."
          dismissible={false}
        />
      )}
      {formState === "error" && error && (
        <Banner
          variant="error"
          heading="Couldn't validate key"
          body={error}
          dismissible={false}
        />
      )}
    </div>
  );
}
