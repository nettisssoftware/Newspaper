import { mmToCssPx } from "./formats";
import type { FormatModel } from "./schema";

export interface Grid {
  pageW: number;
  pageH: number;
  margin: { top: number; right: number; bottom: number; left: number };
  columns: number;
  gutter: number;
  contentX: number;
  contentW: number;
  colW: number;
  columnX: (index: number) => number;
  span: (start: number, count: number) => { x: number; w: number };
}

function marginToPx(value: number, format: FormatModel): number {
  if (format.unit === "px" && format.preset !== "a4" && format.preset !== "a3" && format.preset !== "tabloid") {
    return value;
  }
  return mmToCssPx(value);
}

export function buildGrid(pageW: number, pageH: number, format: FormatModel): Grid {
  const margin = {
    top: marginToPx(format.margins.top, format),
    right: marginToPx(format.margins.right, format),
    bottom: marginToPx(format.margins.bottom, format),
    left: marginToPx(format.margins.left, format),
  };
  const gutter = marginToPx(format.gutter, format);
  const columns = Math.max(1, Math.min(6, format.columns));
  const contentX = margin.left;
  const contentW = pageW - margin.left - margin.right;
  const colW = (contentW - gutter * (columns - 1)) / columns;

  const columnX = (index: number) => contentX + index * (colW + gutter);
  const span = (start: number, count: number) => ({
    x: columnX(start),
    w: colW * count + gutter * (count - 1),
  });

  return {
    pageW,
    pageH,
    margin,
    columns,
    gutter,
    contentX,
    contentW,
    colW,
    columnX,
    span,
  };
}

export function guideLines(grid: Grid, contentY: number, contentH: number): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (let i = 0; i < grid.columns; i++) {
    const x = grid.columnX(i);
    lines.push({ x1: x, y1: contentY, x2: x, y2: contentY + contentH });
    lines.push({
      x1: x + grid.colW,
      y1: contentY,
      x2: x + grid.colW,
      y2: contentY + contentH,
    });
  }
  return lines;
}
