const MAX_BYTES = 15 * 1024 * 1024;
const MAX_EDGE = 1440;

/**
 * Reads an image the person picked, scaled down to a sensible size for social
 * posts, as a data URL.
 *
 * Scaling happens in the browser so a 12 MB phone photo isn't uploaded (or, in
 * the mock, stored) at full size. With the real API this is where the file is
 * sent to the upload endpoint and the hosted URL comes back instead.
 */
export async function readImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file, such as a JPG or PNG.");
  if (file.size > MAX_BYTES) throw new Error("That image is over 15 MB. Choose a smaller one.");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That file couldn't be read as an image. Try a JPG or PNG.");
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

/** "#Small Business!" -> "#SmallBusiness". Null when nothing usable is left. */
export function normalizeHashtag(raw: string): string | null {
  const word = raw.replace(/^#+/, "").replace(/[^\p{L}\p{N}_]/gu, "");
  return word ? `#${word}` : null;
}
