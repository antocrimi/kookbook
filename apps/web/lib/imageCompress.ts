// Client-side image compression for capture uploads.
//
// Per PRD 02: target ~2000px long edge, JPEG quality ~85, < ~600KB.
// Vision models don't need higher resolution and we save tokens.
//
// Browser-only — uses canvas + createImageBitmap. Safe for HEIC on iOS
// since iOS Safari now decodes HEIC into ImageBitmap.

const MAX_LONG_EDGE = 2000;
const JPEG_QUALITY = 0.85;

export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const longEdge = Math.max(bitmap.width, bitmap.height);
  const scale = longEdge > MAX_LONG_EDGE ? MAX_LONG_EDGE / longEdge : 1;
  const targetW = Math.round(bitmap.width * scale);
  const targetH = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) throw new Error("canvas toBlob returned null");
  return blob;
}
