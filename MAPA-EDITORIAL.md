================================================================================
MAPA EDITORIAL — Newspaper Renderer
Dónde tocar cada cosa. No es un tutorial.
================================================================================
Versión del documento : 1.1
Producto              : herramienta privada de composición editorial
Idioma de la UI       : español
Clave de persistencia : editorial-newspaper-renderer-v2  (localStorage)

Este archivo describe QUÉ hace cada archivo editable del proyecto, QUÉ lógica
contiene y CÓMO extenderlo sin romper la arquitectura.

Es un MAPA DE INTERVENCIÓN, no un tutorial. Si vienes con una intención
("quiero añadir X"), busca en la sección 2 (índice inverso). Si vienes con un
archivo en la mano ("¿qué tiene este archivo?"), ve a las secciones 5–11.

No es un CMS, no es un periódico publicado, no hay usuarios ni autenticación.
Es un compositor: el usuario rellena formularios; un motor arma una portada;
otro motor la exporta a imagen / PDF / SVG / ePUB.


--------------------------------------------------------------------------------
1. QUÉ ES ESTE PROYECTO (Y QUÉ NO)
--------------------------------------------------------------------------------

Separación estricta de responsabilidades. No mezclarlas:

  CONTENIDO   =  textos, foto, banners, autor          (schema.content)
  DISEÑO      =  paleta + layout elegido               (schema.design)
  LAYOUT      =  cómo se colocan los bloques en página (layouts + Layouts.tsx)
  FORMATO     =  tamaño de página, márgenes, columnas  (schema.format)
  RENDER      =  raster / vector / paginación          (render/export.ts)

Una misma noticia puede cambiar de layout, de A4 a 1080x1350 o de marfil a
negro editorial SIN tocar el texto original.

Invariantes que NUNCA se rompen:

  - El nombre del medio (masthead) es siempre #0A5C82 (azul océano).
    Las paletas no lo colorean. Los layouts no lo mueven.
  - La cabecera fija (edición, fecha, emisión, hora, dos filetes, nombre del
    medio, banner opcional bajo el nombre) no se desplaza ni se redimensiona
    por el layout del contenido.
  - El usuario no edita JSON a mano. Los formularios escriben el documento.
  - El titular se pasa a mayúsculas con locale español (Ñ, Á, É, Í, Ó, Ú).
  - Calidad del render > velocidad de la interfaz.


--------------------------------------------------------------------------------
2. ÍNDICE INVERSO — "QUIERO AÑADIR X" → ARCHIVOS A TOCAR
--------------------------------------------------------------------------------

Esta sección es la más consultada. Si llegas con una intención ("quiero añadir
un campo", "quiero un layout nuevo"), busca aquí primero. Si llegas con un
archivo en la mano, ve a la sección 5 (mapa directo).

Tres reglas generales antes de tocar nada:

  - Empieza SIEMPRE por schema.ts si el cambio introduce un dato nuevo.
    Si el dato no está en el contrato, la UI no lo puede sostener.
  - Añade el valor al createSampleDocument() para que exista en la muestra.
  - Si rompe la forma del documento, sube el nombre de persistencia en
    store.ts (v2 → v3) o escribe un migrador en onRehydrateStorage.

Atajos por intención:

  QUIERO…                                        TOCAR
  ─────────────────────────────────────────────  ──────────────────────────────
  Añadir un campo de TEXTO al contenido      →   schema.ts (ContentModel)
    (ej. un "kicker" sobre el titular)             + createSampleDocument
                                                   + ContentPanel.tsx (un Field)
                                                   + Layouts.tsx (pintarlo)
                                                   + svg.ts si el motor SVG debe
                                                     llevarlo
                                                   + subir persist si aplica
                                                   [Receta E]

  Añadir un campo a la IMAGEN                →   schema.ts (ImageModel)
    (ej. crédito del fotógrafo)                    + createSampleDocument
                                                   + ContentPanel.tsx
                                                   + Photo.tsx / Caption
                                                   [Receta E]

  Añadir un campo a un BANNER                →   schema.ts (BannerModel)
                                                   + createSampleDocument
                                                   + ContentPanel.tsx
                                                   + FixedHeader.tsx
                                                     (si es below-masthead)
                                                   + NewspaperPage.tsx
                                                     (si es footer)

  Añadir un campo de DISEÑO                  →   schema.ts (DesignModel)
    (ej. sombra de titular)                        + createSampleDocument
                                                   + DesignPanel.tsx
                                                   + compose() si afecta
                                                     geometría
                                                   + el componente de
                                                     newspaper/ que lo pinta

  Añadir un campo de TIPOGRAFÍA              →   schema.ts (TypographyModel)
    (ej. tracking del dek)                         + createSampleDocument
                                                   + TypePanel.tsx
                                                   + typography.ts
                                                     (computeTypeScale)
                                                   + el componente que lo use

  Añadir un campo de FORMATO                 →   schema.ts (FormatModel)
    (ej. bleed / sangrado)                         + createSampleDocument
                                                   + formats.ts
                                                     (resolvePageBox)
                                                   + DesignPanel.tsx
                                                   + grid.ts si cambia
                                                     la retícula

  Añadir un campo de RENDER                  →   schema.ts (RenderModel)
    (ej. fondo transparente en PNG)                + createSampleDocument
                                                   + ExportPanel.tsx
                                                   + render/export.ts

  Añadir un LAYOUT nuevo                     →   [Receta A]
                                                 schema.ts (LayoutId)
                                                 + layouts.ts (LAYOUTS +
                                                   bodyColumnsFor)
                                                 + composition.ts
                                                   (imageHeightFor)
                                                 + Layouts.tsx
                                                   (componente + switch)
                                                 NO tocar FixedHeader.

  Añadir una PALETA                          →   [Receta B]
                                                 schema.ts (PaletteId)
                                                 + palettes.ts (PALETTES)
                                                 DesignPanel se actualiza solo.

  Añadir una FUENTE                          →   [Receta C]
                                                 fonts.ts (FONT_CATALOG)
                                                 TypePanel se actualiza solo.

  Añadir un TAMAÑO DE PÁGINA                 →   [Receta D]
                                                 schema.ts (FormatId)
                                                 + formats.ts
                                                   (FORMAT_PRESETS)
                                                 DesignPanel se actualiza solo.

  Añadir un MOTOR DE SALIDA                  →   schema.ts (OutputFormat)
    (ej. DOCX)                                     + render/export.ts
                                                     (rama nueva en
                                                     exportFromNodes)
                                                   + ExportPanel.tsx
                                                   + triggerDownload /
                                                     filename si el mime
                                                     o la extensión cambian
                                                   Esto NO es como añadir
                                                   una paleta: toca 3–4
                                                   archivos y hay que
                                                   pensarlo.

  Añadir un CHECK DE VALIDACIÓN              →   validation.ts
    (ej. "el pie de foto no se sale")              + EditorApp.tsx si debe
                                                     bloquear la exportación
                                                   + ExportPanel.tsx si debe
                                                     mostrarse con severidad
                                                     nueva
                                                   Los data-role que mide ya
                                                   existen; si renombras uno
                                                   en newspaper/*, actualiza
                                                   validation.ts.

  Añadir un CONTROL en un PANEL              →   El panel correspondiente
    (ej. un switch nuevo en Diseño)                (ContentPanel / DesignPanel
                                                   / TypePanel / ExportPanel)
                                                   + schema.ts si guarda valor
                                                   + store.ts si necesita
                                                     setter propio
                                                   Reutiliza Field.tsx
                                                   (Field / NativeSelect / Row).
                                                   No inventes otro espaciado.

  Añadir un TAB nuevo al editor              →   EditorApp.tsx (EditorTabs)
                                                   + el panel nuevo en src/editor/
                                                   + estado si lo necesita

  Añadir un BOTÓN a la barra del editor      →   EditorApp.tsx
                                                   (handleExport /
                                                   handleRegenerate son el
                                                   patrón)

  Añadir una RUTA nueva                      →   src/routes/ (archivo nuevo)
                                                   + src/router.tsx si hace
                                                     falta lógica de router
                                                   src/routeTree.gen.ts se
                                                   regenera solo: no editar.

  Cambiar el NOMBRE DEL MEDIO de la muestra  →   [Receta G]
                                                 createSampleDocument
                                                   .content.masthead
                                                 El COLOR no se cambia:
                                                 sigue siendo BRAND_OCEAN.
                                                 Si el medio tiene otro hex,
                                                 brand.ts ÚNICAMENTE.

  Cambiar el COLOR DE MARCA (azul océano)    →   brand.ts (BRAND_OCEAN)
                                                 Nada más. El resto importa
                                                 la constante.
                                                 Revisa site.json (color de
                                                 la tarjeta de compartir).

  Cambiar el FAVICON                         →   public/favicon.svg

  Cambiar el TÍTULO de la pestaña web        →   src/routes/__root.tsx

  Cambiar los TEXTOS de la barra superior    →   EditorApp.tsx

  Cambiar el ORDEN de los tabs               →   EditorApp.tsx (EditorTabs)

  Cambiar el TEXTO de la muestra             →   schema.ts (SAMPLE_BODY)

  Cambiar la FOTO de la muestra              →   sustituir
                                                 public/samples/portada.jpg
                                                 (3:2, alta resolución).
                                                 Si la ruta cambia, toca
                                                 createSampleDocument.

  Cambiar el BANNER de la muestra            →   public/samples/banner.jpg

  Cambiar el color de la APP (no del papel)  →   src/styles.css (@theme)
                                                 El color del PAPEL del
                                                 periódico NO está aquí:
                                                 vive en palettes.ts.

  Cambiar el estilo del CUERPO (.np-body)    →   src/styles.css (.np-body)
                                                 No meter Tailwind dentro de
                                                 newspaper/*.

  Cambiar el estilo del EDITOR (UI)          →   src/components/ui/*
                                                 + src/styles.css (@theme)

Qué NO se toca al añadir algo (aunque lo parezca):

  - FixedHeader.tsx              salvo que añadas una FILA a la cabecera;
                                 en ese caso actualiza también
                                 measureHeaderHeight() en typography.ts.
  - composition.ts               es orquestador. Solo se toca si el cambio
                                 altera la geometría (imageHeightFor,
                                 measureHeaderHeight, pageLabels…).
  - store.ts                     solo se toca si el dato necesita setter
                                 propio. Los setters genéricos
                                 (setContent, setDesign…) ya cubren
                                 campos nuevos si van dentro de su modelo.
  - src/routeTree.gen.ts         generado. Nunca.
  - src/lib/*, server/, scripts/ infraestructura del scaffold. No es
                                 del compositor.

Orden típico de un cambio completo (regla mental):

  schema.ts → createSampleDocument → panel (Field) → store (si hace falta)
    → composition.ts (si afecta geometría) → newspaper/* (si se pinta)
    → validation.ts (si debe medirse) → render/* (si debe exportarse)
    → subir persist name si la forma del doc cambió.

  Un cambio bien hecho toca de media 3 archivos. Uno mal hecho toca 1
  (el panel) y no guarda nada.


--------------------------------------------------------------------------------
3. TECNOLOGÍAS EXACTAS (CAPA DE PROGRAMACIÓN)
--------------------------------------------------------------------------------

Lenguaje y runtime
  TypeScript 5.7          tipado estricto, ES2022
  Node.js 22              entorno de build
  ESM                     "type": "module" en package.json

UI
  React 19.2              componentes, hooks
  React DOM 19.2
  TanStack Router 1.170   rutas por archivos (src/routes)
  TanStack Start 1.168    SSR + hidratación (el editor es 100 % cliente)
  Lucide React            iconos
  Sonner                  toasts ("Render listo", errores de exportación)

Estilos
  Tailwind CSS 4.3        @theme en src/styles.css (no hay tailwind.config)
  @tailwindcss/vite       plugin Vite
  class-variance-authority + clsx + tailwind-merge
                          variantes de botones y cn()

Estado
  Zustand 5               store del documento
  zustand/middleware      persist() → localStorage

Validación / datos
  Zod 4                   (disponible en el scaffold; el documento editorial
                          se valida por tipos TS + ValidationEngine propio)

Composición y export
  marked 18               Markdown → HTML del cuerpo
  html-to-image 1.11      raster PNG/JPG/WebP (pixelRatio = dpi/96)
  jsPDF 4                 PDF multipágina
  JSZip 3                 ePUB (ZIP + OPF + XHTML)
  pagedjs 0.4             motor de paginación CSS (@page) en exportación

Componentes de formulario (Radix UI)
  @radix-ui/react-tabs, scroll-area, switch, label, slot
  (el resto de Radix está instalado por el scaffold; no todos se usan)

Build
  Vite 8
  @vitejs/plugin-react
  Nitro 3 (beta)          empaquetado de despliegue
  TypeScript tsc          npm run typecheck

Alias de importación
  @/*  →  ./src/*         (tsconfig.json paths)

Lo que NO usa este producto (está en el scaffold, no lo toques):
  better-auth, Kysely, PGLite, TanStack Query/Table, recharts, react-hook-form.
  No hay cuentas. El documento vive en localStorage.


--------------------------------------------------------------------------------
4. MAPA DE CARPETAS — QUÉ TOCAR Y QUÉ NO
--------------------------------------------------------------------------------

TOCAR (lógica del compositor)

  src/editorial/          motores puros (sin React, salvo tipos)
  src/newspaper/          componentes visuales de la PÁGINA (la portada)
  src/editor/             interfaz del compositor (formularios + preview)
  src/routes/             dos rutas: documento HTML y página /
  src/styles.css          tema de la app + tipografía del cuerpo .np-body
  src/lib/og/site.json    título y color de la tarjeta de compartir
  public/favicon.svg      icono
  public/samples/         foto y banner de la muestra
  MAPA-EDITORIAL.md  este archivo

NO TOCAR salvo que sepas por qué (infraestructura de plataforma)

  src/lib/auth/           autenticación del scaffold, desactivada
  src/lib/app-data/       conectores externos, no usados
  src/lib/db.ts           base de datos, no usada
  src/lib/multiplayer/    no usado
  src/components/preview-host-bridge.tsx   puente del preview embebido
  src/routeTree.gen.ts    generado por el plugin de TanStack Router
  public/__grok/          PWA / install de la plataforma
  server/                 middleware de plataforma
  scripts/                smoke tests, migrate, preview
  migrations/             SQL de auth del scaffold
  vite.config.ts          puertos y plugins de plataforma
  startup.sh              arranque del servidor de desarrollo


--------------------------------------------------------------------------------
5. FLUJO DE DATOS (LEER ESTO ANTES DE EDITAR)
--------------------------------------------------------------------------------

  Usuario escribe en un formulario
           │
           ▼
  src/editor/*Panel.tsx  llama  useEditor().setContent / setDesign / …
           │
           ▼
  src/editorial/store.ts  actualiza NewspaperDocument  (inmutable, spread)
           │              persiste { doc } en localStorage
           │              marca previewStale = true
           ▼
  EditorApp debounce 70 ms  →  previewDoc
           │
           ▼
  compose(previewDoc)     src/editorial/composition.ts
           │              calcula página, retícula, paleta, escala tipográfica,
           │              altura de cabecera, altura de foto, HTML del cuerpo
           ▼
  PreviewStage            escala CSS para que la página quepa en el visor
           │
           ▼
  NewspaperPage           página de tamaño real (px CSS @ 96 dpi)
           ├── FixedHeader     cabecera INMUTABLE
           └── LayoutContent   uno de los 8 layouts
                    ├── Photo
                    └── Body / Caption / Byline

  Exportar:
    ensureFonts → validateComposition → (opcional) Paged.js
    → exportFromNodes (raster / svg / pdf / epub) → triggerDownload


El documento canónico es NewspaperDocument (schema.ts).
La composición calculada es Composition (composition.ts).
Nunca mutar Composition a mano: se regenera en cada compose(doc).


--------------------------------------------------------------------------------
6. EL DOCUMENTO — src/editorial/schema.ts
--------------------------------------------------------------------------------

Es el contrato de datos. Si añades un campo, empieza AQUÍ.

Tipos de unión (IDs)
  LayoutId        8 layouts: image-top, image-left, image-right, image-center,
                  editorial-2col, editorial-3col, image-dominant, modular
  PaletteId       10 paletas + "custom"
  FormatId        a4, a3, tabloid, 1080x1350, 1080x1080, 1080x1920, 1200x675, custom
  ImageFit        cover | contain | focal
  RenderEngineId  pagedjs | svg
  OutputFormat    png | jpg | webp | pdf | svg | epub
  PageNumberStyle arabic | roman | padded | custom-prefix
  BannerSlot      below-masthead | footer

Interfaces
  ContentModel      edición, fecha, emisión, hora, masthead, titular, bajada,
                    imagen, cuerpo markdown, autor, fuente, banners[]
  ImageModel        src, alt, caption, fit, focalX/Y (0–100), aspect
  BannerModel       id, enabled, slot, kind (image | institutional),
                    imageSrc, title, subtitle
  TypographyModel   familias, pesos, escalas, leading, tracking, align
  FormatModel       preset, mm/px, orientación, márgenes, columnas, gutter,
                    pageCount, pageNumbers
  DesignModel       paletteId, customPage/Surface, layoutId, showGuides
  RenderModel       engine, dpi, jpegQuality, output
  NewspaperDocument { schemaVersion: 1, content, design, typography, format, render }

Funciones
  createSampleDocument()  documento inicial de demostración (EL ATLÁNTICO)
  SAMPLE_BODY             texto markdown de la muestra

Cómo añadir un campo nuevo
  1. Añadir la propiedad a la interfaz correspondiente.
  2. Dársela a createSampleDocument().
  3. Exponer el control en el panel adecuado (Content / Design / Type / Export).
  4. Si afecta a la página, leerlo en compose() o en el componente newspaper.
  5. Si cambia la forma del documento, sube schemaVersion y/o el nombre de
     persistencia en store.ts (ahora "editorial-newspaper-renderer-v2") para
     no romper documentos guardados en el navegador.


--------------------------------------------------------------------------------
7. MOTORES EDITORIALES — src/editorial/
--------------------------------------------------------------------------------

Archivos puros de lógica. Preferir no importar React aquí.


7.1  brand.ts  — Identidad de marca (inmutable)
-----------------------------------------------
Constantes
  BRAND_OCEAN              "#0A5C82"   color exclusivo del masthead
  BRAND_NAME               nombre de la app
  HEADER_META_INK          tinta de edición/fecha sobre papel claro
  HEADER_META_INK_ON_DARK  tinta de edición/fecha sobre paletas oscuras

headerMetaInk(luminance)
  Elige tinta de la fila meta según luminancia del papel.
  Umbral 0.42. Las paletas llaman a esto; el azul océano NUNCA pasa por aquí.

Regla: si cambias el color de marca, cámbialo SOLO aquí. El resto importa
BRAND_OCEAN. No lo pongas en Tailwind del periódico (el masthead usa inline).


7.2  palettes.ts  — PaletteEngine
---------------------------------
PALETTES[]
  Lista de fondos. Cada entrada: id, name, page (papel), surface (superficie).
  Tinta, filetes y pies se CALCULAN, no se guardan.

inkFor(page)
  A partir de la luminancia relativa del hex:
    oscuro → ink #f4efe6, muted #c4bdb0, rule semitransparente clara
    claro  → ink #161513, muted #4a463f, rule semitransparente oscura
  El masthead no entra aquí.

resolvePalette(design)
  Si paletteId === "custom", usa design.customPage / customSurface.
  Si no, busca en PALETTES.

contrastRatio / relativeLuminance
  WCAG. Las usa ValidationEngine.

Cómo añadir una paleta
  1. Añadir el id a PaletteId en schema.ts
  2. Añadir { id, name, page, surface } a PALETTES
  DesignPanel recorre PALETTES: el botón aparece solo.


7.3  layouts.ts  — catálogo de layouts (metadatos, no el dibujo)
----------------------------------------------------------------
LAYOUTS[]  cada uno: id, number ("01"…"08"), name, description,
           image (posición), defaultBodyColumns

layoutById(id)
bodyColumnsFor(id, formatColumns)
  Decide cuántas columnas de texto usa cada layout.
  image-left / image-right → 1 (el texto rodea la foto)
  editorial-3col / image-dominant → 3 (o las del formato, 2–4)
  editorial-2col / modular → 2
  el resto respeta format.columns (1–4)

El DIBUJO real de cada layout está en src/newspaper/Layouts.tsx.
Este archivo solo es el menú y las reglas de columnas.

Cómo añadir un layout: ver sección 12.


7.4  formats.ts  — Formato de salida (tamaño de página)
-------------------------------------------------------
PREVIEW_DPI = 96
  La página se compone en píxeles CSS a 96 dpi. La exportación multiplica
  por dpi/96 (300 dpi → pixelRatio 3.125).

FORMAT_PRESETS[]
  a4 210×297 mm, a3, tabloid, y tamaños sociales en px.

mmToCssPx / cssPxToMm
resolvePageBox(format)  → PageBox { width, height, widthMm, heightMm, … }
  Aplica preset o custom, y voltea si orientation = landscape/portrait.

applyPreset(id, orientation)
  Lo llama el store cuando eliges un tamaño en el panel Diseño.

Cómo añadir un formato
  1. Añadir id a FormatId en schema.ts
  2. Añadir entrada en FORMAT_PRESETS
  DesignPanel recorre FORMAT_PRESETS.


7.5  grid.ts  — GridEngine
--------------------------
buildGrid(pageW, pageH, format) → Grid
  Convierte márgenes y gutter a px.
  En presets mm (A4/A3/tabloide) los márgenes se interpretan en milímetros.
  En formatos px, los márgenes se interpretan como px.

  Grid.columnX(index)   x de la columna i
  Grid.span(start, n)   { x, w } de n columnas a partir de start
  contentX, contentW, colW, gutter, columns (1–6)

guideLines(grid, contentY, contentH)
  Líneas verticales de las calles. NewspaperPage las pinta si showGuides.


7.6  typography.ts  — TypographyEngine
--------------------------------------
editorialUppercase(s)
  s.toLocaleUpperCase("es-ES")  — OBLIGATORIO para titulares y metas.
  No usar s.toUpperCase().

computeTypeScale(pageWidth, typography) → TypeScale
  base = pageWidth / 46
  masthead, meta, headline, dek, body, caption, subhead
  Se multiplican por displayScale / dekScale / bodyScale del documento.
  Hay clamps para no bajar de legibilidad ni disparar el masthead.

minReadableBody(pageWidth)
  Suelo de cuerpo. autoAdjust en EditorApp no baja de aquí.

fontStack(family)
  `"${family}", "Source Serif 4", "Times New Roman", Times, serif`

measureHeaderHeight(pageWidth, type, hasBanner)
  Suma de fila meta + 2 filetes + masthead + banner (9.5 % del ancho).
  composition.ts la usa para saber dónde empieza el contenido.
  Si cambias FixedHeader, actualiza ESTA función o el contenido se solapa
  o deja un hueco.


7.7  fonts.ts  — catálogo Google Fonts y carga
----------------------------------------------
FONT_CATALOG[]  ~26 familias. Cada una: id, family, google (query CSS2),
                role (display | body | both), weights, sample.

UI_FONT_HREF
  Source Sans 3 + Fraunces + Playfair Display + Source Serif 4
  Se inyecta en src/routes/__root.tsx para que la UI y la muestra
  no dependan de una carga tardía.

ensureFonts(families)
  1. Inyecta <link> a fonts.googleapis.com
  2. Espera document.fonts.ready (timeout 2 s)
  3. document.fonts.load de 400/700 para cada familia (timeout 1.8 s)
  Devuelve true incluso si falla: la exportación no se queda colgada.
  EditorApp tiene además un fail-open a 2.5 s.

loadCatalogPreviewFonts()
  Precarga TODO el catálogo cuando abres la pestaña Tipo, para que el
  <select> muestre cada familia con su cara.

Cómo añadir una fuente
  1. Añadir un objeto a FONT_CATALOG con el query CSS2 correcto
     (family=Nombre+Fuente:ital,wght@0,400;0,700;1,400)
  2. TypePanel recorre el catálogo: aparece en ambos desplegables.
  No hace falta tocar TypePanel.


7.8  markdown.ts  — cuerpo del artículo
---------------------------------------
renderMarkdown(source)
  marked (GFM, breaks). Renderer propio:
    - HTML crudo se descarta
    - imágenes markdown se descartan (la foto va por ImageModel)
    - h1/h2 → h2, el resto → h3
    - enlaces solo http/https

splitHtmlByParagraphs(html)  trocea por <p> <h2> <h3> blockquote listas
packBlocks(blocks, columns)  reparte bloques en N columnas por peso de texto
                             (no por CSS columns)

escapeHtml  usa "\u0026" + "amp;"  (no escribir "&" literal en fuente:
            algunos pasos de escritura lo decodifican)

El HTML resultante se inyecta con dangerouslySetInnerHTML en Body.tsx.
No meter HTML de usuario sin pasar por este renderer.


7.9  image.ts  — ImageEngine
----------------------------
readImageFile(file)
  FileReader → data URL → compressDataUrl (lado mayor 2400 px, JPEG 0.88)
  Las rutas /samples/… y http no se recomprimen.

objectFitCss(fit)
  contain → contain; cover y focal → cover
  El recorte focal se hace con object-position: focalX% focalY%.

Si el persist de localStorage crece demasiado, es por data URLs de fotos
subidas. No hay backend: la foto vive dentro del JSON persistido.


7.10  composition.ts  — el orquestador
--------------------------------------
compose(doc) → Composition

Pasos, en orden:
  1. resolvePageBox          tamaño real en px
  2. buildGrid               márgenes y columnas
  3. resolvePalette          papel + tinta
  4. computeTypeScale        tamaños de letra
  5. layoutById              definición del layout
  6. measureHeaderHeight     reserva de cabecera
  7. contentY / contentH     área útil bajo la cabecera
  8. imageHeightFor          % del área útil según layout
  9. renderMarkdown + pack   HTML del cuerpo y columnas
 10. pageLabels              "Pág. 1", romano, etc.
 11. editorialUppercase      titular listo para pintar
 12. brand = BRAND_OCEAN     se copia, no se calcula

imageHeightFor(id, contentH, aspect)
  image-dominant  48–58 %
  image-top / editorial-3col  38 %
  image-center  30 %
  modular  40 %
  editorial-2col  36 %
  resto  40 %

formatPageLabel / toRoman
continuationHtml  (reservado para páginas 2+)

SI CAMBIAS la geometría de FixedHeader o de un layout, revisa
measureHeaderHeight e imageHeightFor. Son los dos números que evitan
que el texto se coma la cabecera o que la foto se coma el cuerpo.


7.11  validation.ts  — ValidationEngine
---------------------------------------
validateComposition(doc, composition, rootHTML) → { ok, checks, suggestions }

Checks de bloqueo (severity: "block")
  brand      color computado del [data-role=masthead] ≈ #0A5C82
  header     existe [data-role=fixed-header]
  fit        la página no hace scrollHeight > clientHeight
  headline   el titular no está recortado
  image      object-fit cover/contain (no deformada)
  overlap    titular y foto no se pisan
  contrast   tinta/papel ≥ 7:1 (o 4.5:1 en paletas muy oscuras)
  body-clip  el artículo no se corta

Checks de aviso (severity: "warn")
  font       font-family del titular contiene el nombre pedido
  gutters    calles de columna con el mismo ancho
  columns    cabezas de columna al mismo Y
  margins    margen izq ≈ der

autoFitSuggestion  propone bajar bodyScale / displayScale / imagen.
EditorApp.autoAdjust aplica un 0.94 al bodyScale si hay overflow.

Los data-role son el contrato de medición. Si renombras un data-role
en newspaper/*, actualiza validation.ts.


7.12  store.ts  — estado de la aplicación
-----------------------------------------
Zustand + persist.

Estado
  doc            NewspaperDocument
  fontsReady     las Google Fonts ya respondieron (o timeout)
  previewStale   hubo cambios desde el último Regenerar/Exportar
  hydrated       persist ya leyó localStorage

Setters (todos marcan previewStale y clonan el doc)
  setContent(key, value)     un campo de content
  patchImage(partial)
  patchBanner(id, partial)
  setDesign / setTypography / setFormat / setRender
  setLayout / setPalette / setAlign / setImageFit
  resetSample()              vuelve a createSampleDocument()
  loadDocument(doc)          para un futuro "abrir JSON"
  composition()              compose(get().doc) bajo demanda

setFormat: si llega un preset distinto de "custom", aplica applyPreset
y pisa width/height/unit. No pises a mano widthMm si eliges A4.

partialize: solo se guarda { doc }. fontsReady no se persiste.
storage: localStorage en el cliente; no-op en SSR (window undefined).

Si el documento de muestra cambia de forma y los usuarios tienen un
JSON viejo, cambia `name:` del persist (v2, v3…) o escribe un migrador
en onRehydrateStorage.


7.13  pagedjs.d.ts
------------------
Declaración mínima del módulo "pagedjs" (no trae tipos oficiales).
Exporta class Previewer { preview(content, stylesheets, renderTo) }.


--------------------------------------------------------------------------------
8. MOTORES DE SALIDA — src/editorial/render/
--------------------------------------------------------------------------------

8.1  export.ts  — ExportEngine + raster
---------------------------------------
exportFromNodes(nodes, doc, composition) → { blob, filename, mime }

Ramas
  output === "svg" && engine === "svg"  → composeSvg (vector verdadero)
  output === "svg" && engine pagedjs    → html-to-image toSvg del DOM
  output === "epub"                     → ZIP ePUB 3 (cover.png + chapter.xhtml)
  output === "pdf"                      → jsPDF, una página por canvas
  png / jpg / webp                      → canvas.toBlob

rasterizePages
  ensureFonts + document.fonts.ready
  pixelRatio = clamp(dpi/96, 1, 8)
  toPng de cada [data-np-page] con transform: none (sin el scale del visor)
  pinta el PNG en un canvas

runPagedPreview(source, target, pageCss)
  import dinámico de pagedjs (no se carga en SSR)
  clona el nodo, Preview.preview(clone, [@page size], host oculto)
  EditorApp busca luego .pagedjs_page y rasteriza ESOS nodos.
  Si Paged.js falla, se rasteriza la composición CSS original.

triggerDownload  <a download> + revokeObjectURL a los 4 s
filename         slug del masthead + "-portada." + extensión
                 (quita acentos con NFD)

jpegFromNode     atajo toJpeg


8.2  svg.ts  — motor SVG (vector)
---------------------------------
composeSvg(doc, composition) → string XML

Dibuja:
  rect de papel
  fila meta izquierda / derecha (uppercase es-ES)
  dos filetes
  masthead centrado en BRAND_OCEAN
  titular y bajada con wrap() medido en Canvas 2D
  <image> de la foto con clipPath
  pie de foto
  cuerpo en <foreignObject> por columna (HTML del markdown)

Limitación: el motor SVG implementa sobre todo el esquema "imagen superior".
Los 8 layouts visuales del preview CSS no están todos reimplementados en SVG.
Si el usuario elige motor SVG, espera esa composición canónica.
Para un layout SVG fiel a "imagen izquierda" / "modular", hay que extender
este archivo.


--------------------------------------------------------------------------------
9. DIBUJO DE LA PORTADA — src/newspaper/
--------------------------------------------------------------------------------

Estos componentes pintan la página a tamaño real (width/height del PageBox).
Estilos en su mayoría INLINE (no Tailwind) para que html-to-image capture
colores, fuentes y medidas exactas. Tailwind en la página se rastrea mal
al exportar.

Atributos data-role usados por validación y exportación — no los borres:

  [data-np-page]          cada página (valor = índice)
  [data-role=fixed-header]
  [data-role=edition]
  [data-role=emission]
  [data-role=masthead]    color debe ser #0A5C82
  [data-role=banner]
  [data-role=banner-footer]
  [data-role=content]     área útil bajo la cabecera
  [data-role=headline]
  [data-role=dek]
  [data-role=figure]
  [data-role=photo]
  [data-role=caption]
  [data-role=body]
  [data-role=column]
  [data-role=byline]
  [data-role=author]
  [data-role=source]


9.1  NewspaperPage.tsx
----------------------
Una página. article.np-page lang="es".
Flex column: padding = márgenes de la retícula.

  página 0 → <FixedHeader>
  página 1+ → masthead reducido + filete (continuación)

Luego [data-role=content] con height: contentH, overflow hidden,
dentro <LayoutContent>.

Opcional: banner de pie, número de página, guías de retícula
(borde dashed rgba(10,92,130,0.28) — el azul de marca, al 28 %).


9.2  FixedHeader.tsx  — cabecera inmutable
------------------------------------------
NO recibe layoutId. NO usa paleta para el nombre del medio.

Orden vertical (no reordenar):
  1. fila meta: EDICIÓN n · fecha     EMISIÓN n · hora
  2. filete 0.7 px
  3. masthead centrado, nowrap, color BRAND_OCEAN, peso 700
  4. filete 0.7 px
  5. banner opcional (below-masthead)
       kind=image          foto a sangrado
       kind=institutional  foto 1.1fr + texto 2fr, sello "Espacio institucional"
                           en azul océano

Si añades una fila aquí, actualiza measureHeaderHeight() en typography.ts.


9.3  Layouts.tsx  — los 8 esquemas de contenido
-----------------------------------------------
LayoutContent  switch(composition.layout.id)
  image-left      FloatLayout side=left     foto float, texto rodea
  image-right     FloatLayout side=right
  image-center    CenterLayout              foto al 78 % de ancho, centrada
  editorial-2col  TwoColLayout              foto en col 1, texto en ambas
  editorial-3col  TopImageLayout columns=3
  image-dominant  DominantLayout            foto primero, titular debajo
  modular         ModularLayout             grid 1.15fr / 0.85fr
  default         TopImageLayout            titular, foto, columnas, byline

HeadlineBlock  h1 (composition.headline ya en mayúsculas) + p bajada
ContinuationPage  páginas 2+: rótulo "Continúa · …" + cuerpo

Los floats (02 y 03) son intencionados: es el wrap editorial clásico,
no un grid de dos columnas.

Overflow hidden en el bloque de cuerpo: el texto no puede saltar fuera
de la página. Si se corta, ValidationEngine avisa y autoAdjust reduce cuerpo.


9.4  Body.tsx
-------------
Body
  split && n>1  → CSS grid de columnas, cada una con bodyColumnsHtml[i]
  si no         → column-count + column-fill: balance  (CSS columns)

  hyphens: auto, lang heredado "es", kerning, liga, text-wrap pretty
  className "np-body"  → reglas en styles.css (p, h2, h3, blockquote)

Caption  figcaption italic
Byline   autor + fuente, uppercase, muted


9.5  Photo.tsx
--------------
figure > img
  object-fit según ImageEngine
  object-position: focalX% focalY%
  crossOrigin="anonymous"  necesario para rasterizar en canvas
  height la pasa el layout (composition.imageHeight)


--------------------------------------------------------------------------------
10. INTERFAZ DEL COMPOSITOR — src/editor/
--------------------------------------------------------------------------------

10.1  EditorApp.tsx  — shell
----------------------------
Cabecera de la app (no es la del periódico): marca "Editorial", badges de
layout y formato, botones Muestra / Regenerar / Exportar.

Cuerpo: flex
  móvil   preview arriba (order-1, flex-1), formularios abajo (h-[46 %])
  escritorio  formularios a la izquierda (max 24rem / 38 %), preview a la derecha

Debounce 70 ms de doc → previewDoc para no recomponer en cada tecla.
ensureFonts al cambiar familia, con fail-open 2500 ms.

handleExport
  1. espera fuentes
  2. valida el DOM de las páginas
  3. si hay bloqueo, autoAdjust (baja bodyScale × 0.94)
  4. si motor = pagedjs, intenta Previewer
  5. exportFromNodes + download
  6. toast

handleRegenerate  copia doc → previewDoc y valida
resetSample       store.resetSample()

pagedHost  div fuera de pantalla donde Paged.js pagina.
EditorTabs  Contenido | Diseño | Tipo | Exportar

NO montar dos PreviewStage. stageRef debe apuntar a UN solo raíz o la
exportación rasteriza el nodo equivocado (o ninguno).


10.2  PreviewStage.tsx
----------------------
Mide el contenedor con ResizeObserver.
scale = min(availW/pageW, availH/stackH, 1)
La página se dibuja a tamaño real y se transforma con scale(s)
transform-origin top left.

El wrapper tiene width/height YA escalados para el scroll.
data-preview-root es el nodo que export.ts recorre buscando [data-np-page].

Al exportar, export.ts pone style.transform = "none" en el raster para
no exportar la miniatura, sino 1:1 (× DPI).


10.3  ContentPanel.tsx
----------------------
Formularios de ContentModel.
Subida de foto: <input type=file> → readImageFile → patchImage({ src })
IDs de banner fijos: "leaderboard" y "footer". Si los renombras, rompe
este panel y createSampleDocument.

El titular se guarda tal como lo escribe el usuario (minúsculas permitidas).
compose() lo pasa a mayúsculas. No hagas uppercase en el input.


10.4  DesignPanel.tsx
---------------------
Recorre PALETTES, LAYOUTS, FORMAT_PRESETS: no dupliques esas listas aquí.
Custom paleta: dos <input type=color>
Custom formato: unidad mm/px + ancho/alto
Márgenes en grid 4, columnas 1–6, gutter, guías, números de página.


10.5  TypePanel.tsx
-------------------
Al montar, loadCatalogPreviewFonts().
Desplegables de FONT_CATALOG, preview "La ciudad recuerda", sliders de
peso / escala / leading / tracking.


10.6  ExportPanel.tsx
---------------------
Motor, formato, DPI, calidad JPEG, Validar, Descargar.
Pinta la lista de checks que le pasa EditorApp.


10.7  Field.tsx
---------------
Field     label + children
NativeSelect   <select> oscuro del tema
Row       grid 2 columnas

Usar estos tres en paneles nuevos para no inventar otro espaciado.


--------------------------------------------------------------------------------
11. RUTAS, ESTILOS, ASSETS, UI KIT
--------------------------------------------------------------------------------

src/routes/__root.tsx
  Documento HTML lang="es"
  title, description, theme-color #0e0f12
  preconnect Google Fonts + UI_FONT_HREF + styles.css
  NO poner og: tags (los inyecta la plataforma)
  Monta PreviewHostBridge + AuthProvider + Outlet
  AuthProvider está vacío de cara al producto (auth OFF). No lo quites:
  el scaffold lo espera.

src/routes/index.tsx
  Ruta "/". Renderiza <EditorApp /> y <Toaster theme="dark">.
  Si algún día hay una galería o un visor, se añade otra ruta en src/routes/.

src/router.tsx
  getRouter() nombrado. defaultErrorComponent = AppErrorComponent.
  No cambiar la firma: el plugin de TanStack Start la exige.

src/routeTree.gen.ts
  Generado. No editar.

src/styles.css
  @import "tailwindcss"
  @theme  tokens de la APP (no del periódico):
    --color-bg #0e0f12, --color-brand #0a5c82, --color-desk (fondo del visor),
    --font-sans Source Sans 3, --font-display Fraunces, --font-serif Source Serif 4
  .np-body  párrafos, h2/h3 uppercase, blockquote, listas
  .np-page  antialiasing
  reduced-motion: transiciones a 0.01 ms

  El color del PAPEL del periódico NO está aquí: vive en palettes.ts y se
  aplica inline en NewspaperPage.

src/lib/utils.ts
  cn() = twMerge(clsx(...)). Unir clases Tailwind.

src/lib/og/site.json
  { title, type: "website", card: "custom", color: "0A5C82" }
  Tarjeta de compartir. Si cambias el nombre del producto, actualízalo.

src/lib/error-component.tsx
  Pantalla de error del router. Debe seguir mostrando error.message.

src/components/ui/*
  Primitivos visuales de la APP (botón, input, tabs, switch, badge…).
  Tematizados al editor oscuro. No usarlos DENTRO de la página del periódico.

public/favicon.svg          icono (marca océano)
public/og.jpg               imagen de tarjeta
public/samples/portada.jpg  foto de la muestra (puerto al alba)
public/samples/banner.jpg   arte del banner institucional

Para cambiar la foto de muestra: sustituye portada.jpg (mejor 3:2, alta
resolución) y no hace falta tocar código si la ruta sigue siendo
/samples/portada.jpg.


--------------------------------------------------------------------------------
12. RECETAS DE EXTENSIÓN
--------------------------------------------------------------------------------

Índice de recetas:
  A. Nuevo layout
  B. Nueva paleta
  C. Nueva fuente
  D. Nuevo tamaño de página
  E. Nuevo campo de contenido
  F. Segunda noticia / más fotos
  G. Cambiar el medio de "EL ATLÁNTICO" a otro nombre

A. Nuevo layout (ejemplo: "image-split")
  1. schema.ts        añadir "image-split" a LayoutId
  2. layouts.ts       push en LAYOUTS (number, name, description, image, cols)
                      y un caso en bodyColumnsFor si no vale el default
  3. composition.ts   caso en imageHeightFor (fracción de contentH)
  4. Layouts.tsx      function SplitLayout + case en el switch de LayoutContent
  5. No tocar FixedHeader.
  6. Probar con las paletas claro/oscuro y con A4 + 1080x1350.

B. Nueva paleta
  1. PaletteId + PALETTES[]. El panel se actualiza solo.
  2. Elige un page hex y deja que inkFor calcule la tinta.
  3. Verifica que el masthead sigue #0A5C82 (validation check "brand").

C. Nueva fuente
  1. Entrada en FONT_CATALOG con el query de Google Fonts CSS2.
  2. Nada más. TypePanel y ensureFonts la recogen.

D. Nuevo tamaño de página
  1. FormatId + FORMAT_PRESETS.
  2. Si es papel físico, unit: "mm" y widthMm/heightMm reales.
  3. Si es red social, unit: "px".
  4. computeTypeScale ya escala con el ancho: no hace falta una escala a mano.

E. Nuevo campo de contenido (ej. "kicker" sobre el titular)
  1. ContentModel + createSampleDocument
  2. ContentPanel: un Field
  3. Layouts.tsx HeadlineBlock: pintarlo
  4. svg.ts si el motor SVG debe llevarlo
  5. Sube persist name si el JSON viejo no tiene el campo
     (o default en onRehydrateStorage)

F. Segunda noticia / más fotos
  Hoy hay UNA ImageModel y UN body. Un diseño modular de verdad con varios
  módulos implica:
    - content.stories: Array<{ headline, dek, image, body }>
    - ModularLayout lee stories[0], stories[1]…
    - ContentPanel un editor por módulo
  No lo improvises en Layouts.tsx sin pasar por schema.ts.

G. Cambiar el medio de "EL ATLÁNTICO" a otro nombre
  createSampleDocument().content.masthead
  El usuario también lo cambia en el campo "Nombre del medio".
  El COLOR no se cambia: sigue BRAND_OCEAN. Si el medio tiene otro hex,
  se cambia en brand.ts ÚNICAMENTE.


--------------------------------------------------------------------------------
13. REGLAS PARA NO ROMPER EL RENDER
--------------------------------------------------------------------------------

  1. Estilos del periódico: inline o clase .np-body / .np-page.
     Tailwind dentro de NewspaperPage se pierde o se distorsiona al rasterizar.

  2. No aplicar transform al nodo [data-np-page] aparte del scale del visor.
     export.ts anula transform; un rotate/scale interno se exportaría mal.

  3. Imágenes con crossOrigin="anonymous". Sin eso, el canvas se "taint"
     y toPng falla.

  4. No renderizar el titular con una fuente fallback y luego sustituirla.
     ensureFonts corre antes de exportar. El preview puede mostrar la página
     mientras cargan, pero la exportación espera.

  5. Mayúsculas: editorialUppercase, nunca toUpperCase().

  6. Un solo PreviewStage montado. stageRef único.

  7. Overflow hidden en la página: el periódico no hace scroll interno.
     Si el texto no cabe, se valida y se reajusta; no se deja salir.

  8. Paged.js solo se usa en exportación (host oculto). El visor en vivo
     es CSS Grid / flex / float. No mezclar Previewer en el preview o la
     UI se vuelve lenta y el scale del visor pelea con @page.

  9. schemaVersion y persist name: si rompes compatibilidad, súbelos.

 10. No introducir login, feed, comentarios, ni guardar en servidor
     "porque quedaría bien". El producto es una herramienta personal.


--------------------------------------------------------------------------------
14. CÓMO ORIENTARSE EL PRIMER DÍA
--------------------------------------------------------------------------------

Orden de lectura recomendado (2–3 horas):

  1. Este archivo, secciones 1–5
  2. src/editorial/schema.ts          el documento
  3. src/editorial/composition.ts     el orquestador
  4. src/newspaper/FixedHeader.tsx    lo que no se toca
  5. src/newspaper/Layouts.tsx        lo que sí se toca para maquetar
  6. src/editor/EditorApp.tsx         cómo se dispara exportar
  7. src/editorial/render/export.ts   cómo se genera el archivo

Para depurar una portada fea:
  - Activa "Guías de retícula" en Diseño.
  - Mira composition.imageHeight y composition.contentH (log temporal).
  - Comprueba que measureHeaderHeight coincide con el DOM de FixedHeader.
  - Pestaña Exportar → Validar: lee los checks.

Para depurar una exportación en blanco:
  - fontsReady / ensureFonts
  - imágenes crossOrigin
  - stageRef apuntando al preview visible
  - transform scale anulado

Muestra de fábrica:
  Medio     EL ATLÁNTICO
  Layout    01 Imagen superior
  Paleta    Marfil periódico  #f4efe4
  Formato   A4 vertical
  Tipos     Playfair Display + Source Serif 4
  Motor     Paged.js
  Salida    PNG 300 dpi


--------------------------------------------------------------------------------
15. ÍNDICE RÁPIDO ARCHIVO → RESPONSABILIDAD
--------------------------------------------------------------------------------

src/editorial/brand.ts              color de marca, tinta meta
src/editorial/schema.ts             tipos + documento + muestra
src/editorial/store.ts              estado Zustand + localStorage
src/editorial/palettes.ts           fondos e tinta derivada
src/editorial/layouts.ts            catálogo 01–08 y nº de columnas
src/editorial/formats.ts            tamaños A4/A3/social/custom
src/editorial/grid.ts               retícula, gutters, guías
src/editorial/typography.ts         escala, uppercase es-ES, altura cabecera
src/editorial/fonts.ts              catálogo Google Fonts + ensureFonts
src/editorial/markdown.ts           Markdown → HTML seguro
src/editorial/image.ts              carga, compresión, object-fit
src/editorial/composition.ts        compose() orquesta todo lo anterior
src/editorial/validation.ts         checks de calidad pre-export
src/editorial/pagedjs.d.ts          tipos de Paged.js
src/editorial/render/export.ts      PNG/JPG/WebP/PDF/SVG/ePUB + Paged.js
src/editorial/render/svg.ts         SVG vectorial

src/newspaper/NewspaperPage.tsx     una página completa
src/newspaper/FixedHeader.tsx       cabecera inmutable
src/newspaper/Layouts.tsx           8 maquetas de contenido
src/newspaper/Body.tsx              columnas, pie de foto, autor
src/newspaper/Photo.tsx             recorte focal

src/editor/EditorApp.tsx            shell, debounce, exportar, validar
src/editor/PreviewStage.tsx         auto-fit scale del visor
src/editor/ContentPanel.tsx         formulario de textos e imágenes
src/editor/DesignPanel.tsx          paleta, layout, formato
src/editor/TypePanel.tsx            familias y escalas
src/editor/ExportPanel.tsx          motor, DPI, descargar
src/editor/Field.tsx                label / select / row

src/routes/__root.tsx               HTML, fuentes, css
src/routes/index.tsx                monta el editor
src/router.tsx                      createRouter
src/styles.css                      tema de la app + .np-body
src/lib/utils.ts                    cn()
src/lib/og/site.json                tarjeta de compartir
src/components/ui/*                 kit de controles del editor

public/samples/portada.jpg          foto de la muestra
public/samples/banner.jpg           banner de la muestra
public/favicon.svg                  icono

MAPA-EDITORIAL.md         este archivo


--------------------------------------------------------------------------------
Fin del documento. Mantén este .md al día si añades un layout, un campo
al schema o un motor de salida.
--------------------------------------------------------------------------------