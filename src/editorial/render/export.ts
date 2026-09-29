import { toJpeg, toPng, toSvg as toSvgString } from "html-to-image";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { composeSvg } from "./svg";
import type { Composition } from "../composition";
import { ensureFonts } from "../fonts";
import type { NewspaperDocument, OutputFormat } from "../schema";

export interface ExportResult {
  blob: Blob;
  filename: string;
  mime: string;
}

function mimeFor(fmt: OutputFormat): string {
  if (fmt === "jpg") return "image/jpeg";
  if (fmt === "webp") return "image/webp";
  if (fmt === "pdf") return "application/pdf";
  if (fmt === "svg") return "image/svg+xml";
  if (fmt === "epub") return "application/epub+zip";
  return "image/png";
}

function filename(doc: NewspaperDocument, fmt: OutputFormat): string {
  const slug = (doc.content.masthead || "editorial")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug}-portada.${fmt === "jpg" ? "jpg" : fmt}`;
}

async function waitForImages(node: HTMLElement): Promise<void> {
  const imgs = [...node.querySelectorAll("img")];
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res();
          }),
    ),
  );
}

export async function rasterizePages(
  nodes: HTMLElement[],
  doc: NewspaperDocument,
): Promise<HTMLCanvasElement[]> {
  await ensureFonts([doc.typography.displayFamily, doc.typography.bodyFamily]);
  await document.fonts.ready;
  const ratio = Math.min(8, Math.max(1, doc.render.dpi / 96));
  const canvases: HTMLCanvasElement[] = [];
  for (const node of nodes) {
    await waitForImages(node);
    const dataUrl = await toPng(node, {
      pixelRatio: ratio,
      cacheBust: true,
      backgroundColor: getComputedStyle(node).backgroundColor || "#fff",
      style: { transform: "none" },
    });
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("raster"));
      img.src = dataUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    canvases.push(canvas);
  }
  return canvases;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
  const type = format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
  const q = format === "png" ? undefined : quality;
  return new Promise((res) => canvas.toBlob((b) => res(b ?? new Blob()), type, q));
}

export async function exportFromNodes(
  nodes: HTMLElement[],
  doc: NewspaperDocument,
  composition: Composition,
): Promise<ExportResult> {
  const fmt = doc.render.output;
  await ensureFonts([doc.typography.displayFamily, doc.typography.bodyFamily]);

  if (fmt === "svg") {
    if (doc.render.engine === "svg") {
      const svg = composeSvg(doc, composition);
      return {
        blob: new Blob([svg], { type: "image/svg+xml" }),
        filename: filename(doc, "svg"),
        mime: mimeFor("svg"),
      };
    }
    const svgStr = await toSvgString(nodes[0]!, { cacheBust: true });
    return {
      blob: new Blob([svgStr], { type: "image/svg+xml" }),
      filename: filename(doc, "svg"),
      mime: mimeFor("svg"),
    };
  }

  if (fmt === "epub") {
    return exportEpub(doc, nodes);
  }

  const canvases = await rasterizePages(nodes, doc);

  if (fmt === "pdf") {
    const first = canvases[0]!;
    const pdf = new jsPDF({
      orientation: first.width > first.height ? "landscape" : "portrait",
      unit: "px",
      format: [first.width, first.height],
      hotfixes: ["px_scaling"],
    });
    canvases.forEach((c, i) => {
      if (i > 0) pdf.addPage([c.width, c.height], c.width > c.height ? "landscape" : "portrait");
      pdf.addImage(c.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, c.width, c.height);
    });
    const blob = pdf.output("blob");
    return { blob, filename: filename(doc, "pdf"), mime: mimeFor("pdf") };
  }

  const blob = await canvasToBlob(canvases[0]!, fmt, doc.render.jpegQuality);
  return { blob, filename: filename(doc, fmt), mime: mimeFor(fmt) };
}

async function exportEpub(doc: NewspaperDocument, nodes: HTMLElement[]): Promise<ExportResult> {
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.folder("META-INF")!.file(
    "container.xml",
    `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
  );
  const oebps = zip.folder("OEBPS")!;
  const coverPng = await toPng(nodes[0]!, { pixelRatio: 2, cacheBust: true });
  const coverBin = await (await fetch(coverPng)).arrayBuffer();
  oebps.file("cover.png", coverBin);
  const body = doc.content.body
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeXml(p.replace(/^#+\s+/, ""))}</p>`)
    .join("\n");
  oebps.file(
    "chapter.xhtml",
    `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="es"><head><title>${escapeXml(doc.content.headline)}</title></head><body><h1>${escapeXml(doc.content.headline)}</h1><p><em>${escapeXml(doc.content.dek)}</em></p>${body}</body></html>`,
  );
  oebps.file(
    "content.opf",
    `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bid">editorial-${Date.now()}</dc:identifier>
    <dc:title>${escapeXml(doc.content.headline)}</dc:title>
    <dc:language>es</dc:language>
    <dc:creator>${escapeXml(doc.content.author || "Editorial")}</dc:creator>
    <meta name="cover" content="cover"/>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ch" href="chapter.xhtml" media-type="application/xhtml+xml"/>
    <item id="cover" href="cover.png" media-type="image/png" properties="cover-image"/>
  </manifest>
  <spine><itemref idref="ch"/></spine>
</package>`,
  );
  oebps.file(
    "nav.xhtml",
    `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>nav</title></head><body><nav epub:type="toc"><ol><li><a href="chapter.xhtml">${escapeXml(doc.content.headline)}</a></li></ol></nav></body></html>`,
  );
  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
  return { blob, filename: filename(doc, "epub"), mime: mimeFor("epub") };
}

function escapeXml(s: string): string {
  const amp = "\u0026";
  return s
    .replace(/&/g, amp + "amp;")
    .replace(/</g, amp + "lt;")
    .replace(/>/g, amp + "gt;");
}

export async function runPagedPreview(source: HTMLElement, target: HTMLElement, pageCss: string) {
  const { Previewer } = await import("pagedjs");
  target.innerHTML = "";
  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  const previewer = new Previewer();
  await previewer.preview(clone, [pageCss], target);
}

export function triggerDownload(result: ExportResult) {
  const url = URL.createObjectURL(result.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function jpegFromNode(node: HTMLElement, quality: number, ratio: number): Promise<string> {
  return toJpeg(node, { quality, pixelRatio: ratio, cacheBust: true });
}
