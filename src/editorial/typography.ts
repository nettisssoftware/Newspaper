import type { NewspaperDocument, TypographyModel } from "./schema";

export interface TypeScale {
  masthead: number;
  meta: number;
  headline: number;
  dek: number;
  body: number;
  caption: number;
  subhead: number;
  leading: number;
  letterSpacing: number;
  headlineTracking: number;
}

export function editorialUppercase(value: string): string {
  return value.toLocaleUpperCase("es-ES");
}

export function computeTypeScale(pageWidth: number, typography: TypographyModel): TypeScale {
  const base = pageWidth / 46;
  return {
    masthead: clamp(base * 3.35, 28, 92) * typography.displayScale,
    meta: clamp(base * 0.38, 7.2, 11.5),
    headline: clamp(base * 2.15, 22, 64) * typography.displayScale,
    dek: clamp(base * 0.78, 11, 22) * typography.dekScale,
    body: clamp(base * 0.58, 9.4, 16) * typography.bodyScale,
    caption: clamp(base * 0.42, 7.5, 12),
    subhead: clamp(base * 0.72, 11, 18) * typography.bodyScale,
    leading: typography.leading,
    letterSpacing: typography.letterSpacing,
    headlineTracking: typography.headlineTracking,
  };
}

export function minReadableBody(pageWidth: number): number {
  return clamp(pageWidth / 46 * 0.5, 9, 11);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function fontStack(family: string): string {
  return `"${family}", "Source Serif 4", "Times New Roman", Times, serif`;
}

export function measureHeaderHeight(pageWidth: number, type: TypeScale, hasBanner: boolean): number {
  const metaRow = type.meta * 1.6 + 6;
  const rules = 2 * 1 + 10;
  const masthead = type.masthead * 1.05 + 8;
  const banner = hasBanner ? Math.round(pageWidth * 0.095) + 10 : 0;
  return metaRow + rules + masthead + banner;
}

export function typeFaces(doc: NewspaperDocument): { display: string; body: string } {
  return {
    display: doc.typography.displayFamily,
    body: doc.typography.bodyFamily,
  };
}
