import type { Composition } from "@/editorial/composition";
import { fontStack } from "@/editorial/typography";
import type { NewspaperDocument } from "@/editorial/schema";
import { Body, Byline, Caption } from "./Body";
import { Photo } from "./Photo";

interface Props {
  doc: NewspaperDocument;
  composition: Composition;
  pageIndex?: number;
}

export function LayoutContent({ doc, composition, pageIndex = 0 }: Props) {
  if (pageIndex > 0) return <ContinuationPage doc={doc} composition={composition} pageIndex={pageIndex} />;
  switch (composition.layout.id) {
    case "image-left":
      return <FloatLayout doc={doc} composition={composition} side="left" />;
    case "image-right":
      return <FloatLayout doc={doc} composition={composition} side="right" />;
    case "image-center":
      return <CenterLayout doc={doc} composition={composition} />;
    case "editorial-2col":
      return <TwoColLayout doc={doc} composition={composition} />;
    case "editorial-3col":
      return <TopImageLayout doc={doc} composition={composition} columns={3} />;
    case "image-dominant":
      return <DominantLayout doc={doc} composition={composition} />;
    case "modular":
      return <ModularLayout doc={doc} composition={composition} />;
    default:
      return <TopImageLayout doc={doc} composition={composition} columns={composition.bodyColumns} />;
  }
}

function HeadlineBlock({ doc, composition }: Props) {
  return (
    <div>
      <h1
        data-role="headline"
        style={{
          fontFamily: fontStack(doc.typography.displayFamily),
          fontWeight: doc.typography.displayWeight,
          fontSize: composition.type.headline,
          lineHeight: 1.05,
          letterSpacing: `${composition.type.headlineTracking}em`,
          color: composition.palette.ink,
          margin: 0,
          textWrap: "balance",
          fontKerning: "normal",
        }}
      >
        {composition.headline}
      </h1>
      <p
        data-role="dek"
        style={{
          fontFamily: fontStack(doc.typography.bodyFamily),
          fontWeight: doc.typography.dekWeight,
          fontSize: composition.type.dek,
          lineHeight: 1.32,
          color: composition.palette.ink,
          margin: "10px 0 0",
          maxWidth: "42em",
          textWrap: "pretty",
        }}
      >
        {doc.content.dek}
      </p>
    </div>
  );
}

function TopImageLayout({
  doc,
  composition,
  columns,
}: Props & { columns: number }) {
  const gap = composition.grid.gutter;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, height: "100%", minHeight: 0 }}>
      <HeadlineBlock doc={doc} composition={composition} pageIndex={0} />
      <div>
        <Photo image={doc.content.image} height={composition.imageHeight} />
        <Caption text={doc.content.image.caption} composition={composition} doc={doc} />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Body doc={doc} composition={composition} columns={columns} split />
      </div>
      <Byline doc={doc} composition={composition} />
    </div>
  );
}

function FloatLayout({
  doc,
  composition,
  side,
}: Props & { side: "left" | "right" }) {
  const gap = composition.grid.gutter;
  const imgW = composition.grid.contentW * 0.46;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, height: "100%", minHeight: 0 }}>
      <HeadlineBlock doc={doc} composition={composition} pageIndex={0} />
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <div
          style={{
            float: side,
            width: imgW,
            marginRight: side === "left" ? gap : 0,
            marginLeft: side === "right" ? gap : 0,
            marginBottom: gap,
          }}
        >
          <Photo image={doc.content.image} height={composition.imageHeight} />
          <Caption text={doc.content.image.caption} composition={composition} doc={doc} />
        </div>
        <Body doc={doc} composition={composition} columns={1} />
        <Byline doc={doc} composition={composition} />
      </div>
    </div>
  );
}

function CenterLayout({ doc, composition }: Props) {
  const gap = composition.grid.gutter;
  const imgW = composition.grid.contentW * 0.78;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, height: "100%", minHeight: 0 }}>
      <HeadlineBlock doc={doc} composition={composition} pageIndex={0} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Photo image={doc.content.image} height={composition.imageHeight} width={imgW} />
        <div style={{ width: imgW }}>
          <Caption text={doc.content.image.caption} composition={composition} doc={doc} />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Body doc={doc} composition={composition} split />
      </div>
      <Byline doc={doc} composition={composition} />
    </div>
  );
}

function TwoColLayout({ doc, composition }: Props) {
  const gap = composition.grid.gutter;
  const cols = composition.bodyColumnsHtml;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, height: "100%", minHeight: 0 }}>
      <HeadlineBlock doc={doc} composition={composition} pageIndex={0} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: gap,
          flex: 1,
          minHeight: 0,
        }}
      >
        <div data-role="column" style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
          <Photo image={doc.content.image} height={composition.imageHeight} />
          <Caption text={doc.content.image.caption} composition={composition} doc={doc} />
          <div
            className="np-body"
            style={{ flex: 1, minHeight: 0, overflow: "hidden" }}
          >
            <Body doc={doc} composition={composition} html={cols[0]} columns={1} />
          </div>
        </div>
        <div data-role="column" style={{ minWidth: 0, overflow: "hidden" }}>
          <Body doc={doc} composition={composition} html={cols[1] ?? ""} columns={1} />
          <Byline doc={doc} composition={composition} />
        </div>
      </div>
    </div>
  );
}

function DominantLayout({ doc, composition }: Props) {
  const gap = composition.grid.gutter;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, height: "100%", minHeight: 0 }}>
      <Photo image={doc.content.image} height={composition.imageHeight} />
      <HeadlineBlock doc={doc} composition={composition} pageIndex={0} />
      <Caption text={doc.content.image.caption} composition={composition} doc={doc} />
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Body doc={doc} composition={composition} split columns={composition.bodyColumns} />
      </div>
      <Byline doc={doc} composition={composition} />
    </div>
  );
}

function ModularLayout({ doc, composition }: Props) {
  const gap = composition.grid.gutter;
  const cols = composition.bodyColumnsHtml;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.15fr 0.85fr",
        gridTemplateRows: "auto 1fr",
        gap,
        height: "100%",
        minHeight: 0,
      }}
    >
      <div>
        <Photo image={doc.content.image} height={composition.imageHeight} />
        <Caption text={doc.content.image.caption} composition={composition} doc={doc} />
      </div>
      <div
        style={{
          borderLeft: `0.7px solid ${composition.palette.rule}`,
          paddingLeft: gap,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <HeadlineBlock doc={doc} composition={composition} pageIndex={0} />
        <Byline doc={doc} composition={composition} />
      </div>
      <div data-role="column" style={{ minWidth: 0, overflow: "hidden", gridColumn: "1 / 2" }}>
        <Body doc={doc} composition={composition} html={cols[0]} columns={1} />
      </div>
      <div data-role="column" style={{ minWidth: 0, overflow: "hidden" }}>
        <Body doc={doc} composition={composition} html={cols[1] ?? ""} columns={1} />
      </div>
    </div>
  );
}

function ContinuationPage({ doc, composition, pageIndex = 0 }: Props) {
  const start = pageIndex;
  const slice = composition.bodyColumnsHtml.length
    ? composition.bodyColumnsHtml
    : [composition.bodyHtml];
  const html = slice[Math.min(start, slice.length - 1)] ?? "";
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 10 }}>
      <div
        style={{
          fontFamily: fontStack(doc.typography.bodyFamily),
          fontSize: composition.type.caption,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: composition.palette.muted,
        }}
      >
        Continúa · {composition.headline.slice(0, 48)}
      </div>
      <div
        aria-hidden
        style={{ borderTop: `0.7px solid ${composition.palette.rule}` }}
      />
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Body doc={doc} composition={composition} html={html} split />
      </div>
    </div>
  );
}
