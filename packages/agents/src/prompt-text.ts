/**
 * Text from outside (a website, a search result, the owner's intake) goes to a model only inside
 * a delimited block, so the instructions can say "everything in here is data". The helpers here
 * make sure that text can never close the block early, by accident or as a prompt injection.
 */

/** The block names every agent prompt uses. Instructions refer to them by these names. */
export type DataTag = "site" | "intake" | "page" | "results" | "brief" | "answers";

// The zero-width joiner sits first: the lint reads "x‍y" inside a class as one joined glyph.
const INVISIBLE = /[\u200D\u00AD\u200B\u200C\u2060\uFEFF\u202A-\u202E\u2066-\u2069]/g;

/** An opening or closing tag of any data block, however it is spaced or attributed. Kept in step with DataTag. */
const DATA_TAG = /<\/?\s*(?:site|intake|page|results|brief|answers)\b[^>]*>/gi;

/**
 * Outside text made safe to put inside a data block. Invisible characters go first, so a tag
 * hidden with one ("</si<zero-width space>te>") is caught.
 */
export function cleanText(value: string): string {
  return value.replace(INVISIBLE, "").replace(DATA_TAG, " ");
}

/** Outside text wrapped in its data block, cleaned so it cannot close the block. */
export function asDataBlock(tag: DataTag, text: string): string {
  return `<${tag}>\n${cleanText(text).trim()}\n</${tag}>`;
}
