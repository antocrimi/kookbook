"use client";

import { useState } from "react";
import { Banner, Button, TextArea } from "@cuckoobook/ui";

type ExtractResponse = {
  ok?: boolean;
  model?: string;
  stop_reason?: string;
  input_tokens?: number;
  output_tokens?: number;
  duration_ms?: number;
  text?: string;
  error?: string;
};

export default function TestExtractPage() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(
    "Describe this image in one sentence. If it's a recipe, name the dish.",
  );
  const [response, setResponse] = useState<ExtractResponse | null>(null);
  const [loading, setLoading] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!imageDataUrl) return;
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageDataUrl, prompt }),
      });
      const data = (await res.json()) as ExtractResponse;
      setResponse(data);
    } catch (err) {
      setResponse({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Test extract</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Tracer for the Claude vision call. Pick an image, hit send, see the raw
        response. Uses Haiku to keep cost minimal.
      </p>

      <input type="file" accept="image/*" onChange={onFile} className="text-sm" />

      {imageDataUrl && (
        <div className="flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- data: URL preview, next/image doesn't apply */}
          <img
            src={imageDataUrl}
            alt="preview"
            className="max-h-64 rounded-md border border-zinc-200 object-contain dark:border-zinc-800"
          />
          <TextArea
            label="Prompt"
            rows={3}
            size="full"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button onClick={submit} loading={loading} className="self-start">
            Send to /api/extract
          </Button>
        </div>
      )}

      {response?.error && (
        <Banner variant="error" heading="Extract failed" body={response.error} />
      )}

      {response && !response.error && (
        <pre className="overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-950">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </main>
  );
}
