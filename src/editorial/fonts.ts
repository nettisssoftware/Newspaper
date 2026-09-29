export interface FontOption {
  id: string;
  family: string;
  google: string;
  role: "display" | "body" | "both";
  weights: number[];
  sample: string;
}

export const FONT_CATALOG: FontOption[] = [
  { id: "playfair", family: "Playfair Display", google: "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500", role: "display", weights: [400, 500, 600, 700, 800, 900], sample: "Titular" },
  { id: "newsreader", family: "Newsreader", google: "Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;0,6..72,800;1,6..72,400", role: "both", weights: [400, 500, 600, 700, 800], sample: "Editorial" },
  { id: "fraunces", family: "Fraunces", google: "Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400", role: "display", weights: [400, 500, 600, 700, 800, 900], sample: "Portada" },
  { id: "cormorant", family: "Cormorant Garamond", google: "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500", role: "display", weights: [400, 500, 600, 700], sample: "Garamond" },
  { id: "ebgaramond", family: "EB Garamond", google: "EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400", role: "both", weights: [400, 500, 600, 700, 800], sample: "Clásico" },
  { id: "libre-baskerville", family: "Libre Baskerville", google: "Libre+Baskerville:ital,wght@0,400;0,700;1,400", role: "both", weights: [400, 700], sample: "Baskerville" },
  { id: "source-serif", family: "Source Serif 4", google: "Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400", role: "body", weights: [400, 500, 600, 700], sample: "Cuerpo" },
  { id: "spectral", family: "Spectral", google: "Spectral:ital,wght@0,400;0,500;0,600;0,700;1,400", role: "both", weights: [400, 500, 600, 700], sample: "Spectral" },
  { id: "lora", family: "Lora", google: "Lora:ital,wght@0,400;0,500;0,600;0,700;1,400", role: "body", weights: [400, 500, 600, 700], sample: "Lora" },
  { id: "merriweather", family: "Merriweather", google: "Merriweather:ital,opsz,wght@0,18..144,300;0,18..144,400;0,18..144,700;0,18..144,900;1,18..144,300;1,18..144,400", role: "body", weights: [300, 400, 700, 900], sample: "Merriweather" },
  { id: "pt-serif", family: "PT Serif", google: "PT+Serif:ital,wght@0,400;0,700;1,400", role: "body", weights: [400, 700], sample: "PT Serif" },
  { id: "cardo", family: "Cardo", google: "Cardo:ital,wght@0,400;0,700;1,400", role: "body", weights: [400, 700], sample: "Cardo" },
  { id: "crimson", family: "Crimson Pro", google: "Crimson+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400", role: "body", weights: [400, 500, 600, 700], sample: "Crimson" },
  { id: "instrument", family: "Instrument Serif", google: "Instrument+Serif:ital@0;1", role: "display", weights: [400], sample: "Instrument" },
  { id: "bodoni", family: "Bodoni Moda", google: "Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;0,6..96,700;0,6..96,800;0,6..96,900;1,6..96,400", role: "display", weights: [400, 500, 600, 700, 800, 900], sample: "Bodoni" },
  { id: "old-standard", family: "Old Standard TT", google: "Old+Standard+TT:ital,wght@0,400;0,700;1,400", role: "display", weights: [400, 700], sample: "Old Standard" },
  { id: "libre-caslon", family: "Libre Caslon Text", google: "Libre+Caslon+Text:ital,wght@0,400;0,700;1,400", role: "body", weights: [400, 700], sample: "Caslon" },
  { id: "dm-serif", family: "DM Serif Display", google: "DM+Serif+Display:ital@0;1", role: "display", weights: [400], sample: "DM Serif" },
  { id: "source-sans", family: "Source Sans 3", google: "Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400", role: "body", weights: [400, 500, 600, 700], sample: "Source Sans" },
  { id: "ibm-plex-sans", family: "IBM Plex Sans", google: "IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400", role: "body", weights: [400, 500, 600, 700], sample: "Plex Sans" },
  { id: "ibm-plex-serif", family: "IBM Plex Serif", google: "IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400", role: "both", weights: [400, 500, 600, 700], sample: "Plex Serif" },
  { id: "libre-franklin", family: "Libre Franklin", google: "Libre+Franklin:ital,wght@0,400;0,500;0,600;0,700;1,400", role: "body", weights: [400, 500, 600, 700], sample: "Franklin" },
  { id: "barlow", family: "Barlow", google: "Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400", role: "body", weights: [400, 500, 600, 700], sample: "Barlow" },
  { id: "public-sans", family: "Public Sans", google: "Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400", role: "body", weights: [400, 500, 600, 700], sample: "Public Sans" },
  { id: "karla", family: "Karla", google: "Karla:ital,wght@0,400;0,500;0,600;0,700;1,400", role: "body", weights: [400, 500, 600, 700], sample: "Karla" },
  { id: "news-cycle", family: "News Cycle", google: "News+Cycle:wght@400;700", role: "display", weights: [400, 700], sample: "News Cycle" },
];

const loaded = new Set<string>();

function cssUrl(families: FontOption[]): string {
  const q = families.map((f) => "family=" + f.google).join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

function byId(id: string): FontOption {
  return FONT_CATALOG.find((f) => f.id === id) ?? FONT_CATALOG[0]!;
}

export function injectFontStylesheet(id: string, href: string): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  const existing = document.getElementById(id) as HTMLLinkElement | null;
  if (existing) {
    if (existing.dataset.ready === "1") return Promise.resolve();
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => resolve(), { once: true });
      setTimeout(resolve, 1200);
    });
  }
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    const done = () => {
      link.dataset.ready = "1";
      resolve();
    };
    link.onload = done;
    link.onerror = done;
    document.head.appendChild(link);
    setTimeout(done, 1500);
  });
}

export function fontHrefFor(families: string[]): string {
  const opts = FONT_CATALOG.filter((f) => families.includes(f.family));
  if (!opts.length) return "";
  return cssUrl(opts);
}

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(fallback), ms);
    void p.then((v) => {
      clearTimeout(t);
      resolve(v);
    });
  });
}

export async function ensureFonts(families: string[]): Promise<boolean> {
  if (typeof document === "undefined") return false;
  const unique = [...new Set(families.filter(Boolean))];
  const href = fontHrefFor(unique);
  if (href) {
    const id = "np-fonts-" + unique.join("-").replace(/\s+/g, "");
    await injectFontStylesheet(id, href);
  }
  try {
    await withTimeout(document.fonts.ready, 2000, undefined);
    await Promise.all(
      unique.map(async (family) => {
        if (loaded.has(family)) return;
        await withTimeout(
          Promise.all([
            document.fonts.load(`400 16px "${family}"`),
            document.fonts.load(`700 24px "${family}"`),
            document.fonts.load(`400 12px "${family}"`),
          ]),
          1800,
          [],
        );
        loaded.add(family);
      }),
    );
    return true;
  } catch {
    return true;
  }
}

export function loadCatalogPreviewFonts() {
  void injectFontStylesheet("np-fonts-catalog", cssUrl(FONT_CATALOG));
}

export const UI_FONT_HREF = cssUrl([
  byId("source-sans"),
  byId("fraunces"),
  byId("playfair"),
  byId("source-serif"),
]);
