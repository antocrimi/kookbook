import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Tracer-bullet extract route. Real implementation per docs/prd/04-llm-integration.md
// will read the user's encrypted key from `user_api_keys` via Supabase Vault and
// stream the response. For dev, we read ANTHROPIC_API_KEY from env so we can prove
// the wiring end-to-end without the encryption layer.

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY not set in apps/web/.env.local. Add it and restart `pnpm dev`.",
      },
      { status: 500 },
    );
  }

  let body: { imageDataUrl?: string; prompt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { imageDataUrl, prompt = "Describe this image in one sentence." } = body;
  if (!imageDataUrl) {
    return NextResponse.json(
      { error: "imageDataUrl is required (data: URL)" },
      { status: 400 },
    );
  }

  const match = imageDataUrl.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json(
      { error: "imageDataUrl must be a data: URL with base64 payload" },
      { status: 400 },
    );
  }
  const [, mediaType, base64Data] = match;

  const client = new Anthropic({ apiKey });
  const startedAt = Date.now();

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: base64Data!,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const text = response.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("\n");

    return NextResponse.json({
      ok: true,
      model: response.model,
      stop_reason: response.stop_reason,
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      duration_ms: Date.now() - startedAt,
      text,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Anthropic call failed: ${message}` },
      { status: 502 },
    );
  }
}
