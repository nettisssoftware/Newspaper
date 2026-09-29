import { BRAND_OCEAN } from "../brand";
import type { Composition } from "../composition";
import { objectFitCss } from "../image";
import { fontStack } from "../typography";
import type { NewspaperDocument } from "../schema";

function esc(s: string): string {
  const amp = "\u0026";
  return s
    .replace(/&/g, amp + "amp;")
    .replace(/</g, amp + "lt;")
    .replace(/>/g, amp + "gt;")
    .replace(/"/g, amp + "quot;");
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export function composeSvg(doc: NewspaperDocument, composition: Composition): string {
  const { page, grid, palette, type, headline } = composition;
  const W = page.width;
  const H = page.height;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const display = fontStack(doc.typography.displayFamily);
  const body = fontStack(doc.typography.bodyFamily);
  const x = grid.contentX;
  const w = grid.contentW;
  const y0 = grid.margin.top;

  ctx.font = `${doc.typography.metaWeight} ${type.meta}px ${body}`;
  const leftMeta = `${doc.content.editionLabel}  ${doc.content.edition}  ·  ${doc.content.date}`;
  const rightMeta = `${doc.content.emissionLabel}  ${doc.content.emission}  ·  ${doc.content.time}`;

  let y = y0 + type.meta * 1.4;
  const mastY = y + 10 + type.masthead * 0.82;
  ctx.font = `700 ${type.masthead}px ${display}`;

  const banner = doc.content.banners.find((b) => b.slot === "below-masthead" && b.enabled);
  const bannerH = banner ? Math.round(W * 0.09) : 0;
  const contentY = composition.contentY;
  const imgH = composition.imageHeight;

  ctx.font = `${doc.typography.displayWeight} ${type.headline}px ${display}`;
  const headLines = wrap(ctx, headline, w);
  ctx.font = `${doc.typography.dekWeight} ${type.dek}px ${body}`;
  const dekLines = wrap(ctx, doc.content.dek, w);

  const fit = objectFitCss(doc.content.image.fit);

  const tspans = (lines: string[], size: number, lh: number, fill: string, family: string, weight: number, tracking: number, yStart: number) =>
    lines
      .map((ln, i) => {
        const yy = yStart + i * size * lh;
        return `<text x="${x}" y="${yy}" fill="${fill}" font-family="${esc(family)}" font-size="${size}" font-weight="${weight}" letter-spacing="${tracking * size}" xml:space="preserve">${esc(ln)}</text>`;
      })
      .join("");

  const rule = (yy: number) =>
    `<line x1="${x}" y1="${yy}" x2="${x + w}" y2="${yy}" stroke="${palette.rule}" stroke-width="0.7" />`;

  const mastMax = w * 0.95;
  const mastX = x + (w - mastMax) / 2 + mastMax / 2;

  let cursor = contentY + 4;
  const headBlock = tspans(
    headLines,
    type.headline,
    1.08,
    palette.ink,
    doc.typography.displayFamily,
    doc.typography.displayWeight,
    type.headlineTracking,
    cursor + type.headline,
  );
  cursor += headLines.length * type.headline * 1.08 + 10;
  const dekBlock = tspans(
    dekLines,
    type.dek,
    1.32,
    palette.ink,
    doc.typography.bodyFamily,
    doc.typography.dekWeight,
    0,
    cursor + type.dek,
  );
  cursor += dekLines.length * type.dek * 1.32 + 14;

  const imgY = cursor;
  const imgBlock = `
    <defs>
      <clipPath id="photoClip"><rect x="${x}" y="${imgY}" width="${w}" height="${imgH}" /></clipPath>
    </defs>
    <image href="${esc(doc.content.image.src)}" x="${x}" y="${imgY}" width="${w}" height="${imgH}" preserveAspectRatio="${fit === "contain" ? "xMidYMid meet" : "xMidYMid slice"}" clip-path="url(#photoClip)" />
  `;
  cursor += imgH + 8;
  const caption = doc.content.image.caption
    ? `<text x="${x}" y="${cursor + type.caption}" fill="${palette.caption}" font-family="${esc(doc.typography.bodyFamily)}" font-size="${type.caption}" font-style="italic">${esc(doc.content.image.caption)}</text>`
    : "";
  if (doc.content.image.caption) cursor += type.caption * 1.6 + 8;

  const bodyY = cursor;
  const bodyH = Math.max(40, grid.pageH - grid.margin.bottom - (composition.hasFooterBanner ? 60 : 20) - bodyY);
  const colN = composition.bodyColumns;
  const colW = (w - grid.gutter * (colN - 1)) / colN;
  const bodyForeign = composition.bodyColumnsHtml
    .map((html, i) => {
      const cx = x + i * (colW + grid.gutter);
      return `<foreignObject x="${cx}" y="${bodyY}" width="${colW}" height="${bodyH}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:${esc(body)};font-size:${type.body}px;line-height:${type.leading};color:${palette.ink};text-align:${doc.typography.align};hyphens:auto;lang:es;height:100%;overflow:hidden;">${html}</div>
      </foreignObject>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${palette.page}" />
  <text x="${x}" y="${y}" fill="${composition.metaInk}" font-family="${esc(doc.typography.bodyFamily)}" font-size="${type.meta}" font-weight="${doc.typography.metaWeight}" letter-spacing="${type.meta * 0.18}">${esc(leftMeta.toLocaleUpperCase("es-ES"))}</text>
  <text x="${x + w}" y="${y}" text-anchor="end" fill="${composition.metaInk}" font-family="${esc(doc.typography.bodyFamily)}" font-size="${type.meta}" font-weight="${doc.typography.metaWeight}" letter-spacing="${type.meta * 0.18}">${esc(rightMeta.toLocaleUpperCase("es-ES"))}</text>
  ${rule(y + 6)}
  <text x="${mastX}" y="${mastY}" text-anchor="middle" fill="${BRAND_OCEAN}" font-family="${esc(doc.typography.displayFamily)}" font-size="${type.masthead}" font-weight="700" letter-spacing="${type.masthead * 0.04}">${esc(doc.content.masthead)}</text>
  ${rule(mastY + 8)}
  ${headBlock}
  ${dekBlock}
  ${imgBlock}
  ${caption}
  ${bodyForeign}
</svg>`;
}
