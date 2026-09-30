import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compose } from "@/editorial/composition";
import { ensureFonts } from "@/editorial/fonts";
import { LAYOUTS } from "@/editorial/layouts";
import { exportFromNodes, runPagedPreview, triggerDownload } from "@/editorial/render/export";
import type { NewspaperDocument } from "@/editorial/schema";
import { useEditor } from "@/editorial/store";
import { minReadableBody } from "@/editorial/typography";
import { validateComposition, type Check } from "@/editorial/validation";
import { ContentPanel } from "./ContentPanel";
import { DesignPanel } from "./DesignPanel";
import { ExportPanel } from "./ExportPanel";
import { PreviewStage } from "./PreviewStage";
import { TypePanel } from "./TypePanel";
import {
  AlignLeft,
  Download,
  FileType,
  LayoutTemplate,
  RefreshCw,
  RotateCcw,
  Type as TypeIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export function EditorApp() {
  const doc = useEditor((s) => s.doc);
  const fontsReady = useEditor((s) => s.fontsReady);
  const setFontsReady = useEditor((s) => s.setFontsReady);
  const setTypography = useEditor((s) => s.setTypography);
  const markPreviewFresh = useEditor((s) => s.markPreviewFresh);
  const previewStale = useEditor((s) => s.previewStale);
  const resetSample = useEditor((s) => s.resetSample);

  const [previewDoc, setPreviewDoc] = useState(doc);
  const [tab, setTab] = useState("contenido");
  const [checks, setChecks] = useState<Check[]>([]);
  const [busy, setBusy] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const pagedHost = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setPreviewDoc(doc), 70);
    return () => window.clearTimeout(t);
  }, [doc]);

  useEffect(() => {
    let cancelled = false;
    const failOpen = window.setTimeout(() => {
      if (!cancelled) setFontsReady(true);
    }, 2500);
    void ensureFonts([doc.typography.displayFamily, doc.typography.bodyFamily]).then(() => {
      if (!cancelled) {
        window.clearTimeout(failOpen);
        setFontsReady(true);
      }
    });
    return () => {
      cancelled = true;
      window.clearTimeout(failOpen);
    };
  }, [doc.typography.displayFamily, doc.typography.bodyFamily, setFontsReady]);

  const composition = useMemo(() => compose(previewDoc), [previewDoc]);
  const layout = LAYOUTS.find((l) => l.id === previewDoc.design.layoutId);

  function collectPages(): HTMLElement[] {
    const root = stageRef.current;
    if (!root) return [];
    return [...root.querySelectorAll<HTMLElement>("[data-np-page]")];
  }

  function runValidation(): Check[] {
    const pages = collectPages();
    const result = validateComposition(previewDoc, composition, pages[0] ?? null);
    setChecks(result.checks);
    return result.checks;
  }

  function autoAdjust(): boolean {
    const pages = collectPages();
    const page = pages[0];
    const content = page?.querySelector<HTMLElement>("[data-role='content']");
    if (!content) return false;
    if (content.scrollHeight <= content.clientHeight + 2) return false;
    const min = minReadableBody(composition.page.width);
    const current = composition.type.body;
    if (current <= min + 0.15) return false;
    const next = Math.max(0.82, previewDoc.typography.bodyScale * 0.94);
    setTypography({ bodyScale: next });
    toast.message("Reajuste automático", {
      description: "Se redujo ligeramente el cuerpo para que el texto quepa.",
    });
    return true;
  }

  async function handleExport() {
    setBusy(true);
    try {
      await ensureFonts([doc.typography.displayFamily, doc.typography.bodyFamily]);
      await document.fonts.ready;
      const list = runValidation();
      const blocked = list.some((c) => c.severity === "block" && !c.ok);
      if (blocked) autoAdjust();
      await new Promise((r) => setTimeout(r, 80));

      let nodes = collectPages();
      if (!nodes.length) throw new Error("No hay páginas para exportar");

      if (doc.render.engine === "pagedjs" && pagedHost.current && nodes[0]) {
        try {
          const css = `@page { size: ${composition.page.width}px ${composition.page.height}px; margin: 0; }`;
          await runPagedPreview(nodes[0], pagedHost.current, css);
          const pagedPages = [
            ...pagedHost.current.querySelectorAll<HTMLElement>(".pagedjs_page"),
          ];
          if (pagedPages.length) nodes = pagedPages;
        } catch {
          /* fallback: raster de la composición */
        }
      }

      const result = await exportFromNodes(nodes, doc, composition);
      triggerDownload(result);
      markPreviewFresh();
      toast.success("Render listo", { description: result.filename });
    } catch (err) {
      toast.error("No se pudo exportar", {
        description: err instanceof Error ? err.message : "Error de render",
      });
    } finally {
      setBusy(false);
    }
  }

  function handleRegenerate() {
    setPreviewDoc(doc);
    markPreviewFresh();
    requestAnimationFrame(() => runValidation());
    toast.success("Composición regenerada");
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-bg text-fg">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="block h-5 w-1.5 bg-brand" />
            <div className="min-w-0">
              <p className="font-display text-sm leading-none tracking-tight">Editorial</p>
              <p className="mt-0.5 hidden text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:block">
                Newspaper Renderer
              </p>
            </div>
          </div>
          <Badge className="hidden md:inline-flex">{layout?.name}</Badge>
          <Badge className="hidden lg:inline-flex">{previewDoc.format.preset.toUpperCase()}</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Button type="button" variant="ghost" size="sm" onClick={() => resetSample()} className="hidden sm:inline-flex">
            <RotateCcw />
            Muestra
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={handleRegenerate}>
            <RefreshCw />
            <span className="hidden sm:inline">Regenerar</span>
          </Button>
          <Button type="button" size="sm" onClick={() => void handleExport()} disabled={busy}>
            <Download />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
        <aside className="order-2 flex h-[46%] min-h-0 min-w-0 shrink-0 flex-col overflow-hidden border-t border-border bg-bg-elevated md:order-1 md:h-auto md:w-[min(24rem,38%)] md:shrink md:border-r md:border-t-0">
          <EditorTabs
            tab={tab}
            setTab={setTab}
            checks={checks}
            busy={busy}
            onExport={() => void handleExport()}
            onValidate={runValidation}
          />
        </aside>
        <div className="order-1 min-h-0 min-w-0 flex-1 md:order-2">
          <PreviewPane
            fontsReady={fontsReady}
            previewStale={previewStale}
            previewDoc={previewDoc}
            stageRef={stageRef}
            engine={doc.render.engine}
          />
        </div>
      </div>
      
      <div ref={pagedHost} className="pointer-events-none fixed -left-[200vw] top-0 opacity-0" />
    </div>
  );
}

function PreviewPane({
  fontsReady,
  previewStale,
  previewDoc,
  stageRef,
  engine,
}: {
  fontsReady: boolean;
  previewStale: boolean;
  previewDoc: NewspaperDocument;
  stageRef: React.RefObject<HTMLDivElement | null>;
  engine: string;
}) {
  return (
    <div className="relative flex h-full min-h-0 flex-col bg-desk">
      <div className="flex items-center justify-between px-4 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-muted">
        <span>{fontsReady ? "Fuentes listas" : "Cargando tipos…"}</span>
        <span>
          {engine === "svg" ? "Motor SVG" : "Motor Paged.js"}
          {previewStale ? " · pendiente" : ""}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <PreviewStage doc={previewDoc} stageRef={stageRef} />
      </div>
    </div>
  );
}

function EditorTabs({
  tab,
  setTab,
  checks,
  busy,
  onExport,
  onValidate,
  compact,
}: {
  tab: string;
  setTab: (v: string) => void;
  checks: Check[];
  busy: boolean;
  onExport: () => void;
  onValidate: () => void;
  compact?: boolean;
}) {
  return (
    <Tabs value={tab} onValueChange={setTab} className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-2 py-2">
        <TabsList className="w-full">
          <TabsTrigger value="contenido">
            <AlignLeft className="mr-1 size-3.5" />
            {!compact ? "Contenido" : null}
          </TabsTrigger>
          <TabsTrigger value="diseno">
            <LayoutTemplate className="mr-1 size-3.5" />
            {!compact ? "Diseño" : null}
          </TabsTrigger>
          <TabsTrigger value="tipo">
            <TypeIcon className="mr-1 size-3.5" />
            {!compact ? "Tipo" : null}
          </TabsTrigger>
          <TabsTrigger value="exportar">
            <FileType className="mr-1 size-3.5" />
            {!compact ? "Exportar" : null}
          </TabsTrigger>
        </TabsList>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-3 py-3">
          <TabsContent value="contenido" className="mt-0">
            <ContentPanel />
          </TabsContent>
          <TabsContent value="diseno" className="mt-0">
            <DesignPanel />
          </TabsContent>
          <TabsContent value="tipo" className="mt-0">
            <TypePanel />
          </TabsContent>
          <TabsContent value="exportar" className="mt-0">
            <ExportPanel checks={checks} busy={busy} onExport={onExport} onValidate={onValidate} />
          </TabsContent>
        </div>
      </ScrollArea>
    </Tabs>
  );
}
