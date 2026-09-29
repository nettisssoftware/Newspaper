/** Exclusive masthead brand color. Palettes must never override this. */
export const BRAND_OCEAN = "#0A5C82" as const;

export const BRAND_NAME = "Editorial Newspaper Renderer";

export const HEADER_META_INK = "#1c1c1c";
export const HEADER_META_INK_ON_DARK = "#f3efe6";

export function headerMetaInk(pageLuminance: number): string {
  return pageLuminance < 0.42 ? HEADER_META_INK_ON_DARK : HEADER_META_INK;
}
