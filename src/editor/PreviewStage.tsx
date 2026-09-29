import { compose } from "@/editorial/composition";
import type { NewspaperDocument } from "@/editorial/schema";
import { NewspaperPage } from "@/newspaper/NewspaperPage";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  doc: NewspaperDocument;
  stageRef: React.RefObject<HTMLDivElement | null>;
}

export function PreviewStage({ doc, stageRef }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);
  const composition = useMemo(() => compose(doc), [doc]);
  const pages = Array.from({ length: composition.pageCount }, (_, i) => i);
  const gap = 28;
  const stackH =
    composition.page.height * composition.pageCount + gap * (composition.pageCount - 1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      const pad = 48;
      const availW = Math.max(200, el.clientWidth - pad);
      const availH = Math.max(200, el.clientHeight - pad);
      const s = Math.min(availW / composition.page.width, availH / stackH, 1);
      setScale(s);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [composition.page.width, stackH]);

  return (
    <div ref={wrapRef} className="relative flex h-full min-h-0 w-full items-start justify-center overflow-auto p-6">
      <div
        style={{
          width: composition.page.width * scale,
          height: stackH * scale,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          ref={stageRef}
          data-preview-root
          style={{
            width: composition.page.width,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            display: "flex",
            flexDirection: "column",
            gap,
          }}
        >
          {pages.map((i) => (
            <NewspaperPage key={i} doc={doc} composition={composition} pageIndex={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
