import { buildGrid, type Grid } from "./grid";
import { resolvePageBox, type PageBox } from "./formats";
import { packBlocks, renderMarkdown, splitHtmlByParagraphs } from "./markdown";
import { metaInkForPalette, resolvePalette, type ResolvedPalette } from "./palettes";
import { bodyColumnsFor, layoutById, type LayoutDefinition } from "./layouts";
import {
  computeTypeScale,
  editorialUppercase,
  measureHeaderHeight,
  type TypeScale,
} from "./typography";
import type { NewspaperDocument } from "./schema";
import { BRAND_OCEAN } from "./brand";

export interface Composition {
  page: PageBox;
  grid: Grid;
  palette: ResolvedPalette;
  type: TypeScale;
  layout: LayoutDefinition;
  headerH: number;
  contentY: number;
  contentH: number;
  bodyColumns: number;
  imageHeight: number;
  headline: string;
  bodyHtml: string;
  bodyColumnsHtml: string[];
  pageCount: number;
  pageLabels: string[];
  metaInk: string;
  brand: typeof BRAND_OCEAN;
  hasLeaderboard: boolean;
  hasFooterBanner: boolean;
}

export function compose(doc: NewspaperDocument): Composition {
  const page = resolvePageBox(doc.format);
  const grid = buildGrid(page.width, page.height, doc.format);
  const palette = resolvePalette(doc.design);
  const type = computeTypeScale(page.width, doc.typography);
  const layout = layoutById(doc.design.layoutId);
  const hasLeaderboard = Boolean(doc.content.banners.find((b) => b.slot === "below-masthead" && b.enabled));
  const hasFooterBanner = Boolean(doc.content.banners.find((b) => b.slot === "footer" && b.enabled));
  const headerH = measureHeaderHeight(page.width, type, hasLeaderboard);
  const footerReserve = hasFooterBanner ? Math.round(page.width * 0.072) + 18 : 0;
  const pageNumReserve = doc.format.pageNumbers.enabled ? type.caption * 1.8 + 6 : 8;
  const contentY = grid.margin.top + headerH;
  const contentH = Math.max(80, page.height - contentY - grid.margin.bottom - footerReserve - pageNumReserve);
  const bodyColumns = bodyColumnsFor(doc.design.layoutId, doc.format.columns);
  const imageHeight = imageHeightFor(layout.id, contentH, page.width / page.height);
  const bodyHtml = renderMarkdown(doc.content.body);
  const blocks = splitHtmlByParagraphs(bodyHtml);
  const bodyColumnsHtml = packBlocks(blocks, bodyColumns);
  const pageCount = Math.max(1, Math.min(12, doc.format.pageCount));
  const pageLabels = Array.from({ length: pageCount }, (_, i) =>
    formatPageLabel(doc, i),
  );

  return {
    page,
    grid,
    palette,
    type,
    layout,
    headerH,
    contentY,
    contentH,
    bodyColumns,
    imageHeight,
    headline: editorialUppercase(doc.content.headline.trim()),
    bodyHtml,
    bodyColumnsHtml,
    pageCount,
    pageLabels,
    metaInk: metaInkForPalette(palette),
    brand: BRAND_OCEAN,
    hasLeaderboard,
    hasFooterBanner,
  };
}

function imageHeightFor(id: string, contentH: number, aspect: number): number {
  if (id === "image-dominant") return Math.round(contentH * (aspect > 1.3 ? 0.62 : 0.52));
  if (id === "image-top" || id === "editorial-3col") return Math.round(contentH * 0.32);
  if (id === "image-center") return Math.round(contentH * 0.28);
  if (id === "modular") return Math.round(contentH * 0.36);
  if (id === "editorial-2col") return Math.round(contentH * 0.34);
  return Math.round(contentH * 0.42);
}

export function formatPageLabel(doc: NewspaperDocument, index: number): string {
  const n = doc.format.pageNumbers.start + index;
  const { style, prefix } = doc.format.pageNumbers;
  let core = String(n);
  if (style === "roman") core = toRoman(n);
  if (style === "padded") core = String(n).padStart(2, "0");
  if (style === "custom-prefix") return `${prefix} ${core}`.trim();
  return prefix ? `${prefix} ${core}` : core;
}

function toRoman(num: number): string {
  const map: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let n = Math.max(1, Math.round(num));
  let out = "";
  for (const [v, s] of map) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

export function continuationHtml(remaining: string[], startIndex: number): string[] {
  return remaining.slice(startIndex);
}
