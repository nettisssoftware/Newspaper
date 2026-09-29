import { contrastRatio } from "./palettes";
import { BRAND_OCEAN } from "./brand";
import { minReadableBody } from "./typography";
import type { Composition } from "./composition";
import type { NewspaperDocument } from "./schema";

export interface Check {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
  severity: "block" | "warn";
}

export interface ValidationResult {
  ok: boolean;
  checks: Check[];
  suggestions: string[];
}

export function validateComposition(
  doc: NewspaperDocument,
  composition: Composition,
  root: HTMLElement | null,
): ValidationResult {
  const checks: Check[] = [];
  const suggestions: string[] = [];
  const page = root?.querySelector<HTMLElement>("[data-np-page='0']") ?? root;

  const masthead = page?.querySelector<HTMLElement>("[data-role='masthead']");
  const mastColor = masthead ? getComputedColor(masthead) : BRAND_OCEAN;
  checks.push({
    id: "brand",
    label: "Identidad de marca intacta",
    ok: colorsClose(mastColor, BRAND_OCEAN),
    detail: masthead
      ? `Color del medio: ${mastColor.toUpperCase()}`
      : "Cabecera no medida todavía",
    severity: "block",
  });

  const header = page?.querySelector("[data-role='fixed-header']");
  checks.push({
    id: "header",
    label: "Cabecera fija presente",
    ok: Boolean(header),
    detail: header ? "Edición, emisión, nombre y filetes en su lugar" : "Falta la cabecera",
    severity: "block",
  });

  const overflow = page ? page.scrollHeight > page.clientHeight + 2 : false;
  checks.push({
    id: "fit",
    label: "El contenido cabe en la página",
    ok: !overflow,
    detail: overflow
      ? "Hay desbordamiento vertical"
      : "La composición cabe en el formato",
    severity: "block",
  });

  const headline = page?.querySelector<HTMLElement>("[data-role='headline']");
  const clipped = headline ? isTruncated(headline) : false;
  checks.push({
    id: "headline",
    label: "Titular completo",
    ok: !clipped && Boolean(doc.content.headline.trim()),
    detail: clipped ? "El titular queda cortado" : "Titular visible entero",
    severity: "block",
  });

  const img = page?.querySelector<HTMLImageElement>("[data-role='photo']");
  const distorted = img ? isDistorted(img) : false;
  checks.push({
    id: "image",
    label: "Imagen sin deformar",
    ok: !distorted,
    detail: distorted ? "La fotografía no respeta su proporción" : "Recorte cover/contain correcto",
    severity: "block",
  });

  const body = page?.querySelector<HTMLElement>("[data-role='body']");
  const overlap = Boolean(headline && img && rectsOverlap(headline, img));
  checks.push({
    id: "overlap",
    label: "Sin solapamientos accidentales",
    ok: !overlap,
    detail: overlap ? "Hay cajas superpuestas" : "Elementos separados",
    severity: "block",
  });

  const ratio = contrastRatio(composition.palette.ink, composition.palette.page);
  checks.push({
    id: "contrast",
    label: "Contraste de lectura",
    ok: ratio >= 7 || (ratio >= 4.5 && composition.palette.luminance < 0.2),
    detail: `Relación ${ratio.toFixed(1)}:1`,
    severity: "block",
  });

  const fontOk = fontMatches(headline, doc.typography.displayFamily);
  checks.push({
    id: "font",
    label: "Tipografía cargada",
    ok: fontOk,
    detail: fontOk
      ? `Familia de titular: ${doc.typography.displayFamily}`
      : "Puede estar usándose una fuente de sustitución",
    severity: "warn",
  });

  const cols = page?.querySelectorAll("[data-role='column']") ?? [];
  let guttersEven = true;
  if (cols.length >= 2) {
    const xs = [...cols].map((c) => c.getBoundingClientRect().left).sort((a, b) => a - b);
    const gaps: number[] = [];
    for (let i = 1; i < xs.length; i++) {
      const prev = cols[i - 1]!.getBoundingClientRect();
      gaps.push(xs[i]! - (prev.left + prev.width));
    }
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    guttersEven = gaps.every((g) => Math.abs(g - avg) < 2);
  }
  checks.push({
    id: "gutters",
    label: "Gutters uniformes",
    ok: guttersEven,
    detail: guttersEven ? "Calles de columna regulares" : "Las calles no coinciden",
    severity: "warn",
  });

  const aligned = cols.length < 2 || columnTopsAligned([...cols]);
  checks.push({
    id: "columns",
    label: "Columnas alineadas",
    ok: aligned,
    detail: aligned ? "Cabezas de columna al mismo nivel" : "Desnivel en columnas",
    severity: "warn",
  });

  const ml = composition.grid.margin.left;
  const mr = composition.grid.margin.right;
  checks.push({
    id: "margins",
    label: "Márgenes laterales equilibrados",
    ok: Math.abs(ml - mr) < 1,
    detail: `Izq. ${ml.toFixed(1)} · der. ${mr.toFixed(1)}`,
    severity: "warn",
  });

  if (overflow) {
    suggestions.push("Redistribuir el desarrollo o aumentar páginas");
    if (composition.type.body > minReadableBody(composition.page.width) + 0.4) {
      suggestions.push("Reducir ligeramente el cuerpo, sin bajar de un tamaño legible");
    }
    suggestions.push("Disminuir la altura de la imagen o el interlineado");
  }

  if (body && isTruncated(body)) {
    checks.push({
      id: "body-clip",
      label: "Cuerpo sin recortar",
      ok: false,
      detail: "El artículo se corta al final del área",
      severity: "block",
    });
    suggestions.push("Añadir una página o acortar el desarrollo");
  }

  const blocking = checks.filter((c) => c.severity === "block" && !c.ok);
  return { ok: blocking.length === 0, checks, suggestions };
}

function getComputedColor(el: HTMLElement): string {
  const c = getComputedStyle(el).color;
  const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return BRAND_OCEAN;
  const hex = [m[1], m[2], m[3]]
    .map((n) => Number(n).toString(16).padStart(2, "0"))
    .join("");
  return `#${hex}`;
}

function colorsClose(a: string, b: string): boolean {
  return a.replace("#", "").toLowerCase().slice(0, 6) === b.replace("#", "").toLowerCase().slice(0, 6);
}

function isTruncated(el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2;
}

function isDistorted(img: HTMLImageElement): boolean {
  const fit = getComputedStyle(img).objectFit;
  if (fit === "cover" || fit === "contain") return false;
  if (!img.naturalWidth || !img.naturalHeight) return false;
  const na = img.naturalWidth / img.naturalHeight;
  const da = img.clientWidth / Math.max(1, img.clientHeight);
  return Math.abs(na - da) > 0.12;
}

function rectsOverlap(a: HTMLElement, b: HTMLElement): boolean {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  return !(r1.right <= r2.left + 1 || r1.left >= r2.right - 1 || r1.bottom <= r2.top + 1 || r1.top >= r2.bottom - 1);
}

function fontMatches(el: HTMLElement | null | undefined, family: string): boolean {
  if (!el) return true;
  const cs = getComputedStyle(el).fontFamily.toLowerCase();
  return cs.includes(family.toLowerCase().split(" ")[0]!);
}

function columnTopsAligned(cols: Element[]): boolean {
  const tops = cols.map((c) => c.getBoundingClientRect().top);
  const min = Math.min(...tops);
  return tops.every((t) => Math.abs(t - min) < 3);
}

export function autoFitSuggestion(composition: Composition): { bodyScale: number; displayScale: number; imageShrink: number } {
  return {
    bodyScale: Math.max(0.86, composition.type.body / (composition.type.body + 0.6)),
    displayScale: Math.max(0.9, 0.96),
    imageShrink: 0.9,
  };
}
