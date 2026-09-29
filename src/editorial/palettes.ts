import { headerMetaInk } from "./brand";
import type { DesignModel, PaletteId } from "./schema";

export interface ResolvedPalette {
  id: PaletteId;
  name: string;
  page: string;
  surface: string;
  ink: string;
  muted: string;
  rule: string;
  caption: string;
  luminance: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

export function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function inkFor(page: string): Pick<ResolvedPalette, "ink" | "muted" | "rule" | "caption" | "luminance"> {
  const luminance = relativeLuminance(page);
  const dark = luminance < 0.42;
  return {
    luminance,
    ink: dark ? "#f4efe6" : "#161513",
    muted: dark ? "#c4bdb0" : "#4a463f",
    rule: dark ? "rgba(244,239,230,0.38)" : "rgba(22,21,19,0.55)",
    caption: dark ? "#d2cbbd" : "#3f3c36",
  };
}

export const PALETTES: Array<Omit<ResolvedPalette, "ink" | "muted" | "rule" | "caption" | "luminance"> & { page: string; surface: string }> = [
  { id: "blanco", name: "Blanco editorial", page: "#fbfbf9", surface: "#f3f1ea" },
  { id: "marfil", name: "Marfil periódico", page: "#f4efe4", surface: "#ebe4d4" },
  { id: "gris-papel", name: "Gris papel", page: "#e7e4dc", surface: "#ddd9cf" },
  { id: "crema", name: "Crema cálido", page: "#f6edd8", surface: "#eeddc0" },
  { id: "gris-frio", name: "Gris frío", page: "#e8eaee", surface: "#dce0e6" },
  { id: "negro", name: "Negro editorial", page: "#121110", surface: "#1c1b19" },
  { id: "azul-noche", name: "Azul noche", page: "#0c141c", surface: "#15202b" },
  { id: "beige", name: "Beige prensa", page: "#e9dcc4", surface: "#dfd0b4" },
  { id: "envejecido", name: "Papel envejecido", page: "#e4d3b1", surface: "#d9c49a" },
  { id: "grafito", name: "Gris grafito", page: "#2a2c2e", surface: "#35383b" },
  { id: "custom", name: "Personalizado", page: "#f4efe4", surface: "#ebe4d4" },
];

export function resolvePalette(design: DesignModel): ResolvedPalette {
  const base =
    PALETTES.find((p) => p.id === design.paletteId) ?? PALETTES[1]!;
  const page = design.paletteId === "custom" ? design.customPage : base.page;
  const surface = design.paletteId === "custom" ? design.customSurface : base.surface;
  return {
    id: design.paletteId,
    name: base.name,
    page,
    surface,
    ...inkFor(page),
  };
}

export function metaInkForPalette(palette: ResolvedPalette): string {
  return headerMetaInk(palette.luminance);
}
