import type { CSSProperties } from "react";
import type { Composition } from "@/editorial/composition";
import { fontStack } from "@/editorial/typography";
import type { NewspaperDocument } from "@/editorial/schema";

interface Props {
  doc: NewspaperDocument;
  composition: Composition;
  html?: string;
  columns?: number;
  split?: boolean;
}

export function Body({ doc, composition, html, columns, split }: Props) {
  const n = columns ?? composition.bodyColumns;
  const family = fontStack(doc.typography.bodyFamily);
  const { type, palette, grid } = composition;
  const align = doc.typography.align;

  if (split && n > 1) {
    return (
      <div
        data-role="body"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
          columnGap: grid.gutter,
          alignItems: "start",
        }}
      >
        {composition.bodyColumnsHtml.map((col, i) => (
          <div
            key={i}
            data-role="column"
            className="np-body"
            style={bodyStyle(family, type.body, type.leading, type.letterSpacing, palette.ink, align, type.subhead)}
            dangerouslySetInnerHTML={{ __html: col }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      data-role="body"
      className="np-body"
      style={{
        ...bodyStyle(family, type.body, type.leading, type.letterSpacing, palette.ink, align, type.subhead),
        columnCount: n,
        columnGap: grid.gutter,
        columnFill: "balance",
      }}
      dangerouslySetInnerHTML={{ __html: html ?? composition.bodyHtml }}
    />
  );
}

function bodyStyle(
  family: string,
  size: number,
  leading: number,
  tracking: number,
  color: string,
  align: string,
  subhead: number,
): CSSProperties {
  return {
    fontFamily: family,
    fontSize: size,
    lineHeight: leading,
    letterSpacing: `${tracking}em`,
    color,
    textAlign: align as CSSProperties["textAlign"],
    hyphens: "auto",
    WebkitHyphens: "auto",
    overflowWrap: "break-word",
    textWrap: "pretty",
    fontKerning: "normal",
    fontFeatureSettings: '"kern" 1, "liga" 1',
    ["--np-subhead" as string]: `${subhead}px`,
  };
}

export function Caption({
  text,
  composition,
  doc,
}: {
  text: string;
  composition: Composition;
  doc: NewspaperDocument;
}) {
  if (!text) return null;
  return (
    <figcaption
      data-role="caption"
      style={{
        fontFamily: fontStack(doc.typography.bodyFamily),
        fontSize: composition.type.caption,
        fontStyle: "italic",
        lineHeight: 1.35,
        color: composition.palette.caption,
        marginTop: 6,
      }}
    >
      {text}
    </figcaption>
  );
}

export function Byline({ doc, composition }: { doc: NewspaperDocument; composition: Composition }) {
  if (!doc.content.author && !doc.content.source) return null;
  return (
    <footer
      data-role="byline"
      style={{
        marginTop: 12,
        fontFamily: fontStack(doc.typography.bodyFamily),
        fontSize: composition.type.caption,
        color: composition.palette.muted,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontWeight: doc.typography.metaWeight,
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      {doc.content.author ? <span data-role="author">{doc.content.author}</span> : null}
      {doc.content.source ? <span data-role="source">{doc.content.source}</span> : null}
    </footer>
  );
}
