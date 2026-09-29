import type { FormatId, FormatModel, Orientation } from "./schema";

const MM_TO_IN = 1 / 25.4;
export const PREVIEW_DPI = 96;

export interface PageBox {
  width: number;
  height: number;
  widthMm: number;
  heightMm: number;
  cssWidth: number;
  cssHeight: number;
}

export const FORMAT_PRESETS: Array<{
  id: FormatId;
  name: string;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  unit: "mm" | "px";
}> = [
  { id: "a4", name: "A4", widthMm: 210, heightMm: 297, widthPx: 794, heightPx: 1123, unit: "mm" },
  { id: "a3", name: "A3", widthMm: 297, heightMm: 420, widthPx: 1123, heightPx: 1587, unit: "mm" },
  { id: "tabloid", name: "Tabloide", widthMm: 279, heightMm: 432, widthPx: 1056, heightPx: 1632, unit: "mm" },
  { id: "1080x1350", name: "1080 × 1350", widthMm: 0, heightMm: 0, widthPx: 1080, heightPx: 1350, unit: "px" },
  { id: "1080x1080", name: "1080 × 1080", widthMm: 0, heightMm: 0, widthPx: 1080, heightPx: 1080, unit: "px" },
  { id: "1080x1920", name: "1080 × 1920", widthMm: 0, heightMm: 0, widthPx: 1080, heightPx: 1920, unit: "px" },
  { id: "1200x675", name: "1200 × 675", widthMm: 0, heightMm: 0, widthPx: 1200, heightPx: 675, unit: "px" },
  { id: "custom", name: "Personalizado", widthMm: 210, heightMm: 297, widthPx: 1080, heightPx: 1350, unit: "mm" },
];

export function mmToCssPx(mm: number): number {
  return (mm * MM_TO_IN) * PREVIEW_DPI;
}

export function cssPxToMm(px: number): number {
  return (px / PREVIEW_DPI) / MM_TO_IN;
}

export function resolvePageBox(format: FormatModel): PageBox {
  let w: number;
  let h: number;
  let wMm: number;
  let hMm: number;

  if (format.preset === "custom") {
    if (format.unit === "mm") {
      wMm = format.widthMm;
      hMm = format.heightMm;
      w = mmToCssPx(wMm);
      h = mmToCssPx(hMm);
    } else {
      w = format.widthPx;
      h = format.heightPx;
      wMm = cssPxToMm(w);
      hMm = cssPxToMm(h);
    }
  } else {
    const preset = FORMAT_PRESETS.find((p) => p.id === format.preset) ?? FORMAT_PRESETS[0]!;
    if (preset.unit === "mm") {
      wMm = preset.widthMm;
      hMm = preset.heightMm;
      w = mmToCssPx(wMm);
      h = mmToCssPx(hMm);
    } else {
      w = preset.widthPx;
      h = preset.heightPx;
      wMm = cssPxToMm(w);
      hMm = cssPxToMm(h);
    }
  }

  if (format.orientation === "landscape" && h > w) {
    [w, h] = [h, w];
    [wMm, hMm] = [hMm, wMm];
  }
  if (format.orientation === "portrait" && w > h) {
    [w, h] = [h, w];
    [wMm, hMm] = [hMm, wMm];
  }

  return { width: w, height: h, widthMm: wMm, heightMm: hMm, cssWidth: w, cssHeight: h };
}

export function applyPreset(id: FormatId, orientation: Orientation): Partial<FormatModel> {
  const preset = FORMAT_PRESETS.find((p) => p.id === id) ?? FORMAT_PRESETS[0]!;
  return {
    preset: id,
    widthMm: preset.widthMm || 210,
    heightMm: preset.heightMm || 297,
    widthPx: preset.widthPx,
    heightPx: preset.heightPx,
    unit: preset.unit,
    orientation,
  };
}
