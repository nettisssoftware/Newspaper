import { marked, type Tokens } from "marked";

const renderer = new marked.Renderer();

renderer.html = () => "";
renderer.link = ({ href, text }: Tokens.Link) => {
  const safe = href && /^https?:/i.test(href) ? href : "#";
  return `<a href="${safe}" rel="noreferrer">${escapeHtml(text)}</a>`;
};
renderer.image = () => "";
renderer.heading = ({ text, depth }: Tokens.Heading) => {
  const tag = depth <= 2 ? "h2" : "h3";
  return `<${tag}>${escapeHtml(text)}</${tag}>`;
};

marked.setOptions({
  gfm: true,
  breaks: true,
  renderer,
});

export function renderMarkdown(source: string): string {
  const html = marked.parse(source ?? "", { async: false }) as string;
  return html;
}

export function markdownPlainParagraphs(source: string): string[] {
  return (source ?? "")
    .split(/\n{2,}/)
    .map((p) => p.replace(/^#+\s+/, "").replace(/[*_#>`]/g, "").trim())
    .filter(Boolean);
}

export function splitHtmlByParagraphs(html: string): string[] {
  const parts = html
    .split(/(?=<p>|<h2>|<h3>|<blockquote>|<ul>|<ol>)/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [html];
}

export function packBlocks(blocks: string[], columns: number): string[] {
  if (columns <= 1) return [blocks.join("")];
  const weights = blocks.map((b) => b.replace(/<[^>]+>/g, " ").length || 1);
  const total = weights.reduce((a, b) => a + b, 0);
  const target = total / columns;
  const cols: string[][] = Array.from({ length: columns }, () => []);
  let i = 0;
  let acc = 0;
  for (let b = 0; b < blocks.length; b++) {
    cols[i]!.push(blocks[b]!);
    acc += weights[b]!;
    if (acc >= target * (i + 1) && i < columns - 1) i += 1;
  }
  return cols.map((c) => c.join(""));
}

function escapeHtml(s: string): string {
  const amp = "\u0026";
  return s
    .replace(/&/g, amp + "amp;")
    .replace(/</g, amp + "lt;")
    .replace(/>/g, amp + "gt;")
    .replace(/"/g, amp + "quot;");
}
