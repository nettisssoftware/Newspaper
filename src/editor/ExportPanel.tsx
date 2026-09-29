import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditor } from "@/editorial/store";
import type { Check } from "@/editorial/validation";
import { Download, LoaderCircle, ShieldCheck } from "lucide-react";
import { Field, NativeSelect, Row } from "./Field";

interface Props {
  checks: Check[];
  busy: boolean;
  onExport: () => void;
  onValidate: () => void;
}

export function ExportPanel({ checks, busy, onExport, onValidate }: Props) {
  const doc = useEditor((s) => s.doc);
  const setRender = useEditor((s) => s.setRender);
  const blocking = checks.filter((c) => c.severity === "block" && !c.ok);

  return (
    <div className="flex flex-col gap-4 pb-8">
      <Field label="Motor de render">
        <NativeSelect
          value={doc.render.engine}
          onChange={(v) => setRender({ engine: v as "pagedjs" | "svg" })}
        >
          <option value="pagedjs">Paged.js</option>
          <option value="svg">SVG</option>
        </NativeSelect>
      </Field>
      <Field label="Formato de salida">
        <NativeSelect
          value={doc.render.output}
          onChange={(v) => setRender({ output: v as typeof doc.render.output })}
        >
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="webp">WebP</option>
          <option value="pdf">PDF</option>
          <option value="svg">SVG</option>
          <option value="epub">ePUB</option>
        </NativeSelect>
      </Field>
      <Row>
        <Field label="DPI">
          <NativeSelect
            value={String(doc.render.dpi)}
            onChange={(v) => setRender({ dpi: Number(v) })}
          >
            <option value="96">96 · pantalla</option>
            <option value="150">150</option>
            <option value="200">200</option>
            <option value="300">300 · impresión</option>
            <option value="600">600 · alta</option>
          </NativeSelect>
        </Field>
        <Field label="Calidad JPEG">
          <Input
            type="number"
            min={0.5}
            max={1}
            step={0.01}
            value={doc.render.jpegQuality}
            onChange={(e) => setRender({ jpegQuality: Number(e.target.value) })}
          />
        </Field>
      </Row>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onValidate}>
          <ShieldCheck />
          Validar
        </Button>
        <Button type="button" className="flex-1" onClick={onExport} disabled={busy}>
          {busy ? <LoaderCircle className="animate-spin" /> : <Download />}
          Descargar
        </Button>
      </div>
      {checks.length ? (
        <ul className="flex flex-col gap-1.5">
          {checks.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs"
            >
              <span className="text-fg">{c.label}</span>
              <span className={c.ok ? "text-ok" : c.severity === "block" ? "text-danger" : "text-muted"}>
                {c.ok ? "Correcto" : c.detail}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {blocking.length ? (
        <p className="text-xs text-danger">
          Hay avisos de bloqueo. El motor intentará reajustar antes de exportar si hace falta.
        </p>
      ) : null}
    </div>
  );
}
