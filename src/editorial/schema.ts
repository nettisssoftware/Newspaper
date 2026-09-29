import { BRAND_OCEAN } from "./brand";

export type LayoutId =
  | "image-top"
  | "image-left"
  | "image-right"
  | "image-center"
  | "editorial-2col"
  | "editorial-3col"
  | "image-dominant"
  | "modular";

export type PaletteId =
  | "blanco"
  | "marfil"
  | "gris-papel"
  | "crema"
  | "gris-frio"
  | "negro"
  | "azul-noche"
  | "beige"
  | "envejecido"
  | "grafito"
  | "custom";

export type FormatId =
  | "a4"
  | "a3"
  | "tabloid"
  | "1080x1350"
  | "1080x1080"
  | "1080x1920"
  | "1200x675"
  | "custom";

export type ImageFit = "cover" | "contain" | "focal";
export type TextAlign = "left" | "right" | "center" | "justify";
export type RenderEngineId = "pagedjs" | "svg";
export type OutputFormat = "png" | "jpg" | "webp" | "pdf" | "svg" | "epub";
export type PageNumberStyle = "arabic" | "roman" | "padded" | "custom-prefix";
export type BannerSlot = "below-masthead" | "footer";
export type Orientation = "portrait" | "landscape";

export interface BannerModel {
  id: string;
  enabled: boolean;
  slot: BannerSlot;
  kind: "image" | "institutional";
  imageSrc: string;
  title: string;
  subtitle: string;
}

export interface ImageModel {
  src: string;
  alt: string;
  caption: string;
  fit: ImageFit;
  focalX: number;
  focalY: number;
  aspect: string;
}

export interface ContentModel {
  editionLabel: string;
  edition: string;
  date: string;
  emissionLabel: string;
  emission: string;
  time: string;
  masthead: string;
  headline: string;
  dek: string;
  image: ImageModel;
  body: string;
  author: string;
  source: string;
  banners: BannerModel[];
}

export interface TypographyModel {
  displayFamily: string;
  bodyFamily: string;
  displayWeight: number;
  dekWeight: number;
  bodyWeight: number;
  metaWeight: number;
  displayScale: number;
  dekScale: number;
  bodyScale: number;
  leading: number;
  letterSpacing: number;
  headlineTracking: number;
  align: TextAlign;
}

export interface FormatModel {
  preset: FormatId;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  unit: "mm" | "px";
  orientation: Orientation;
  margins: { top: number; right: number; bottom: number; left: number };
  columns: number;
  gutter: number;
  pageCount: number;
  pageNumbers: {
    enabled: boolean;
    start: number;
    style: PageNumberStyle;
    prefix: string;
  };
}

export interface DesignModel {
  paletteId: PaletteId;
  customPage: string;
  customSurface: string;
  layoutId: LayoutId;
  showGuides: boolean;
}

export interface RenderModel {
  engine: RenderEngineId;
  dpi: number;
  jpegQuality: number;
  output: OutputFormat;
}

export interface NewspaperDocument {
  schemaVersion: 1;
  content: ContentModel;
  design: DesignModel;
  typography: TypographyModel;
  format: FormatModel;
  render: RenderModel;
}

export const SAMPLE_BODY = `En el archivo del puerto, las bitácoras no distinguen entre mercancía y memoria. Cada entrada —toneladas de trigo, nombres de capitanes, la hora exacta de una marea— está escrita con la misma tinta que usaba la prensa de la ciudad para titular el día. Cien años después, esa coincidencia deja de parecer casual.

El primer muelle de hormigón se inauguró un martes de niebla. No hubo discurso memorable. Hubo, en cambio, una fotografía borrosa y una columna en tercera página que hablaba de «porvenir» como si la palabra pesara menos que un saco de café. Hoy el porvenir es un expediente: planos, reclamaciones, actas de un concejo que discutía si el faro debía pintarse de blanco o de gris.

## El archivo y la marea

Los historiadores del municipio han reconstruido, con paciencia de linotipista, la cadena que unía el puerto a las redacciones. Los telegramas llegaban al muelle antes que a la plaza. Las noticias del otro lado del océano se olían en la sal antes de leerse en plomo. De ahí que esta ciudad haya aprendido a mirar el horizonte como quien revisa una prueba de galera.

No es nostalgia. Es un método. Donde otros archivos clasifican por año, aquí se clasifica por viento. Donde otros museos exhiben anclas, aquí se exhiben titulares. El mar, que no firma sus crónicas, ha dejado sin embargo un estilo: frases cortas, datos precisos, y de vez en cuando una imagen que no necesita pie porque el lector ya conoce la orilla.

La exposición que abre esta semana no pretende cerrar el relato. Pretende devolverlo a la calle, a la escala en la que fue escrito: la de un periódico doblado bajo el brazo, todavía fresco de tinta, mientras el vapor de un barco se deshace detrás de los depósitos.

## Una orilla, dos oficios

Hubo un tiempo en que el linotipista y el práctico del puerto se saludaban al amanecer. Uno fundía plomo; el otro leía boyas. Ambos trabajaban contra el reloj de una marea que no espera. Esa disciplina —la de llegar a tiempo, la de no dejar una línea huérfana ni un cabo suelto— es la que esta edición intenta recuperar.

El lector encontrará en estas páginas un inventario de nombres, de muelles y de cabeceras desaparecidas. No es un catálogo. Es una portada: el gesto de volver a componer, con tipos y márgenes, lo que la ciudad ya sabía pero había dejado de ver.`;

export function createSampleDocument(): NewspaperDocument {
  return {
    schemaVersion: 1,
    content: {
      editionLabel: "EDICIÓN",
      edition: "Nº 247",
      date: "Lunes 28 de septiembre de 2026",
      emissionLabel: "EMISIÓN",
      emission: "Mañana",
      time: "06:00",
      masthead: "EL ATLÁNTICO",
      headline:
        "La ciudad recuerda lo que el mar nunca olvida",
      dek: "Un siglo después del primer puerto moderno, el archivo municipal revela cómo el comercio, la prensa y la memoria urbana se escribieron sobre la misma orilla.",
      image: {
        src: "/samples/portada.jpg",
        alt: "Puerto atlántico al amanecer, con niebla y depósitos de ladrillo",
        caption:
          "El muelle viejo, fotografiado al alba. La niebla oculta el casco y deja a la vista la geometría de los depósitos.",
        fit: "cover",
        focalX: 48,
        focalY: 42,
        aspect: "3 / 2",
      },
      body: SAMPLE_BODY,
      author: "Redacción Editorial",
      source: "Archivo Municipal / El Atlántico",
      banners: [
        {
          id: "leaderboard",
          enabled: true,
          slot: "below-masthead",
          kind: "institutional",
          imageSrc: "/samples/banner.jpg",
          title: "Temporada cultural",
          subtitle: "Archivo del Puerto · Sala de Bitácoras · 2026",
        },
        {
          id: "footer",
          enabled: false,
          slot: "footer",
          kind: "image",
          imageSrc: "/samples/banner.jpg",
          title: "",
          subtitle: "",
        },
      ],
    },
    design: {
      paletteId: "marfil",
      customPage: "#f4efe4",
      customSurface: "#ebe4d4",
      layoutId: "image-top",
      showGuides: false,
    },
    typography: {
      displayFamily: "Playfair Display",
      bodyFamily: "Source Serif 4",
      displayWeight: 700,
      dekWeight: 500,
      bodyWeight: 400,
      metaWeight: 500,
      displayScale: 1,
      dekScale: 1,
      bodyScale: 1,
      leading: 1.42,
      letterSpacing: 0,
      headlineTracking: 0.012,
      align: "justify",
    },
    format: {
      preset: "a4",
      widthMm: 210,
      heightMm: 297,
      widthPx: 1080,
      heightPx: 1350,
      unit: "mm",
      orientation: "portrait",
      margins: { top: 14, right: 16, bottom: 16, left: 16 },
      columns: 2,
      gutter: 6,
      pageCount: 1,
      pageNumbers: {
        enabled: true,
        start: 1,
        style: "arabic",
        prefix: "Pág.",
      },
    },
    render: {
      engine: "pagedjs",
      dpi: 300,
      jpegQuality: 0.92,
      output: "png",
    },
  };
}

export { BRAND_OCEAN };
