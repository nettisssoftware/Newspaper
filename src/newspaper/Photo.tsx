import type { CSSProperties } from "react";
import { objectFitCss } from "@/editorial/image";
import type { ImageModel } from "@/editorial/schema";

interface Props {
  image: ImageModel;
  height?: number | string;
  width?: number | string;
  style?: CSSProperties;
}

export function Photo({ image, height, width, style }: Props) {
  return (
    <figure
      data-role="figure"
      style={{
        margin: 0,
        width: width ?? "100%",
        height: height,
        overflow: "hidden",
        background: "rgba(0,0,0,0.06)",
        ...style,
      }}
    >
      <img
        data-role="photo"
        src={image.src}
        alt={image.alt}
        crossOrigin="anonymous"
        style={{
          width: "100%",
          height: "100%",
          objectFit: objectFitCss(image.fit),
          objectPosition: `${image.focalX}% ${image.focalY}%`,
          display: "block",
        }}
      />
    </figure>
  );
}
