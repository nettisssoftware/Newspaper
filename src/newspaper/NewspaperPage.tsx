import type { Composition } from "@/editorial/composition";
import { guideLines } from "@/editorial/grid";
import { fontStack } from "@/editorial/typography";
import type { NewspaperDocument } from "@/editorial/schema";
import { FixedHeader } from "./FixedHeader";
import { LayoutContent } from "./Layouts";

interface Props {
  doc: NewspaperDocument;
  composition: Composition;
  pageIndex: number;
}

export function NewspaperPage({ doc, composition, pageIndex }: Props) {
  const { page, grid, palette, type } = composition;
  const footer = doc.content.banners.find((b) => b.slot === "footer" && b.enabled);
  const footerH = composition.hasFooterBanner ? Math.round(page.width * 0.072) : 0;
  const guides = doc.design.showGuides
    ? guideLines(grid, composition.contentY, composition.contentH)
    : [];

  return (
    <article
      data-np-page={pageIndex}
      className="np-page"
      lang="es"
      style={{
        width: page.width,
        height: page.height,
        background: palette.page,
        color: palette.ink,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 24px 60px -28px rgba(0,0,0,0.55)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          paddingTop: grid.margin.top,
          paddingBottom: grid.margin.bottom,
        }}
      >
        {pageIndex === 0 ? (
          <FixedHeader doc={doc} composition={composition} />
        ) : (
          <div
            style={{
              width: grid.contentW,
              marginLeft: grid.contentX,
              paddingBottom: 8,
            }}
          >
            <div
              data-role="masthead"
              style={{
                color: composition.brand,
                fontFamily: fontStack(doc.typography.displayFamily),
                fontWeight: 700,
                fontSize: type.meta * 1.35,
                letterSpacing: "0.22em",
                textAlign: "center",
              }}
            >
              {doc.content.masthead}
            </div>
            <div
              aria-hidden
              style={{ borderTop: `0.7px solid ${palette.rule}`, marginTop: 6 }}
            />
          </div>
        )}
        <div
          data-role="content"
          style={{
            width: grid.contentW,
            marginLeft: grid.contentX,
            height: composition.contentH,
            marginTop: pageIndex === 0 ? 10 : 8,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <LayoutContent doc={doc} composition={composition} pageIndex={pageIndex} />
        </div>
        {footer ? (
          <div
            data-role="banner-footer"
            style={{
              width: grid.contentW,
              marginLeft: grid.contentX,
              height: footerH,
              marginTop: "auto",
              overflow: "hidden",
              border: `0.7px solid ${palette.rule}`,
            }}
          >
            <img
              src={footer.imageSrc}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : null}
        {doc.format.pageNumbers.enabled ? (
          <div
            style={{
              width: grid.contentW,
              marginLeft: grid.contentX,
              marginTop: 8,
              textAlign: "center",
              fontFamily: fontStack(doc.typography.bodyFamily),
              fontSize: type.caption,
              letterSpacing: "0.16em",
              color: palette.muted,
            }}
          >
            {composition.pageLabels[pageIndex]}
          </div>
        ) : null}
      </div>
      {guides.map((g, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left: g.x1,
            top: g.y1,
            width: 0,
            height: g.y2 - g.y1,
            borderLeft: "1px dashed rgba(10,92,130,0.28)",
            pointerEvents: "none",
          }}
        />
      ))}
    </article>
  );
}
