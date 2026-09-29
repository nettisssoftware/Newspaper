import { BRAND_OCEAN } from "@/editorial/brand";
import type { Composition } from "@/editorial/composition";
import { fontStack } from "@/editorial/typography";
import type { NewspaperDocument } from "@/editorial/schema";

interface Props {
  doc: NewspaperDocument;
  composition: Composition;
}

export function FixedHeader({ doc, composition }: Props) {
  const { type, grid, metaInk, hasLeaderboard } = composition;
  const banner = doc.content.banners.find((b) => b.slot === "below-masthead" && b.enabled);
  const bannerH = hasLeaderboard ? Math.round(composition.page.width * 0.095) : 0;
  const display = fontStack(doc.typography.displayFamily);
  const body = fontStack(doc.typography.bodyFamily);

  return (
    <header
      data-role="fixed-header"
      style={{
        width: grid.contentW,
        marginLeft: grid.contentX,
        paddingTop: 2,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          color: metaInk,
          fontFamily: body,
          fontSize: type.meta,
          fontWeight: doc.typography.metaWeight,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          lineHeight: 1.2,
        }}
      >
        <span data-role="edition">
          {doc.content.editionLabel} {doc.content.edition}
          <span style={{ margin: "0 0.55em", opacity: 0.45 }}>·</span>
          {doc.content.date}
        </span>
        <span data-role="emission" style={{ textAlign: "right" }}>
          {doc.content.emissionLabel} {doc.content.emission}
          <span style={{ margin: "0 0.55em", opacity: 0.45 }}>·</span>
          {doc.content.time}
        </span>
      </div>
      <div
        aria-hidden
        style={{
          height: 0,
          borderTop: `0.7px solid ${composition.palette.rule}`,
          marginTop: 7,
          marginBottom: 6,
        }}
      />
      <div
        data-role="masthead"
        style={{
          color: BRAND_OCEAN,
          fontFamily: display,
          fontWeight: 700,
          fontSize: type.masthead,
          lineHeight: 0.92,
          letterSpacing: "0.045em",
          textAlign: "center",
          width: "95%",
          margin: "0 auto",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "clip",
        }}
      >
        {doc.content.masthead}
      </div>
      <div
        aria-hidden
        style={{
          height: 0,
          borderTop: `0.7px solid ${composition.palette.rule}`,
          marginTop: 7,
          marginBottom: hasLeaderboard ? 8 : 2,
        }}
      />
      {banner ? (
        <div
          data-role="banner"
          style={{
            height: bannerH,
            overflow: "hidden",
            border: `0.7px solid ${composition.palette.rule}`,
            background: composition.palette.surface,
            display: "flex",
            alignItems: "stretch",
          }}
        >
          {banner.kind === "image" && banner.imageSrc ? (
            <img
              src={banner.imageSrc}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 2fr",
                width: "100%",
                height: "100%",
              }}
            >
              <div
                style={{
                  overflow: "hidden",
                  borderRight: `0.7px solid ${composition.palette.rule}`,
                }}
              >
                <img
                  src={banner.imageSrc}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  padding: "0 14px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  fontFamily: body,
                  color: composition.palette.ink,
                }}
              >
                <div
                  style={{
                    fontSize: type.caption,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: BRAND_OCEAN,
                    fontWeight: 600,
                  }}
                >
                  Espacio institucional
                </div>
                <div
                  style={{
                    fontFamily: display,
                    fontSize: type.dek * 0.92,
                    fontWeight: 600,
                    lineHeight: 1.15,
                    marginTop: 2,
                  }}
                >
                  {banner.title}
                </div>
                <div style={{ fontSize: type.caption, color: composition.palette.muted, marginTop: 2 }}>
                  {banner.subtitle}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
}
