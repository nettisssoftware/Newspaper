import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FORMAT_PRESETS } from "@/editorial/formats";
import { LAYOUTS } from "@/editorial/layouts";
import { PALETTES } from "@/editorial/palettes";
import { useEditor } from "@/editorial/store";
import { cn } from "@/lib/utils";
import { Field, NativeSelect, Row } from "./Field";

export function DesignPanel() {
  const doc = useEditor((s) => s.doc);
  const setPalette = useEditor((s) => s.setPalette);
  const setLayout = useEditor((s) => s.setLayout);
  const setFormat = useEditor((s) => s.setFormat);
  const setDesign = useEditor((s) => s.setDesign);

  return (
    <div className="flex flex-col gap-5 pb-8">
      <section>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted">Paleta de fondo</p>
        <div className="grid grid-cols-2 gap-1.5">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPalette(p.id)}
              className={cn(
                "flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs",
                doc.design.paletteId === p.id
                  ? "border-primary bg-surface"
                  : "border-border bg-transparent hover:bg-surface-2",
              )}
            >
              <span
                className="size-5 shrink-0 rounded-sm border border-border"
                style={{ background: p.page }}
              />
              {p.name}
            </button>
          ))}
        </div>
        {doc.design.paletteId === "custom" ? (
          <Row>
            <Field label="Página">
              <Input
                type="color"
                value={doc.design.customPage}
                onChange={(e) => setDesign({ customPage: e.target.value })}
              />
            </Field>
            <Field label="Superficie">
              <Input
                type="color"
                value={doc.design.customSurface}
                onChange={(e) => setDesign({ customSurface: e.target.value })}
              />
            </Field>
          </Row>
        ) : null}
      </section>

      <section>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted">Layout</p>
        <div className="grid grid-cols-1 gap-1.5">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLayout(l.id)}
              className={cn(
                "rounded-md border px-3 py-2 text-left",
                doc.design.layoutId === l.id
                  ? "border-primary bg-surface"
                  : "border-border hover:bg-surface-2",
              )}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[0.65rem] text-muted">{l.number}</span>
                <span className="text-sm text-fg">{l.name}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{l.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-wide text-muted">Formato</p>
        <Field label="Tamaño de página">
          <NativeSelect
            value={doc.format.preset}
            onChange={(v) => setFormat({ preset: v as typeof doc.format.preset })}
          >
            {FORMAT_PRESETS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        {doc.format.preset === "custom" ? (
          <>
            <Field label="Unidad">
              <NativeSelect
                value={doc.format.unit}
                onChange={(v) => setFormat({ unit: v as "mm" | "px" })}
              >
                <option value="mm">Milímetros</option>
                <option value="px">Píxeles</option>
              </NativeSelect>
            </Field>
            <Row>
              <Field label="Ancho">
                <Input
                  type="number"
                  value={doc.format.unit === "mm" ? doc.format.widthMm : doc.format.widthPx}
                  onChange={(e) =>
                    setFormat(
                      doc.format.unit === "mm"
                        ? { widthMm: Number(e.target.value) }
                        : { widthPx: Number(e.target.value) },
                    )
                  }
                />
              </Field>
              <Field label="Alto">
                <Input
                  type="number"
                  value={doc.format.unit === "mm" ? doc.format.heightMm : doc.format.heightPx}
                  onChange={(e) =>
                    setFormat(
                      doc.format.unit === "mm"
                        ? { heightMm: Number(e.target.value) }
                        : { heightPx: Number(e.target.value) },
                    )
                  }
                />
              </Field>
            </Row>
          </>
        ) : null}
        <Field label="Orientación">
          <NativeSelect
            value={doc.format.orientation}
            onChange={(v) => setFormat({ orientation: v as "portrait" | "landscape" })}
          >
            <option value="portrait">Vertical</option>
            <option value="landscape">Horizontal</option>
          </NativeSelect>
        </Field>
        <Row>
          <Field label="Páginas">
            <Input
              type="number"
              min={1}
              max={12}
              value={doc.format.pageCount}
              onChange={(e) => setFormat({ pageCount: Math.max(1, Number(e.target.value) || 1) })}
            />
          </Field>
          <Field label="Nº inicial">
            <Input
              type="number"
              value={doc.format.pageNumbers.start}
              onChange={(e) =>
                setFormat({
                  pageNumbers: { ...doc.format.pageNumbers, start: Number(e.target.value) || 1 },
                })
              }
            />
          </Field>
        </Row>
        <Row>
          <Field label="Estilo de número">
            <NativeSelect
              value={doc.format.pageNumbers.style}
              onChange={(v) =>
                setFormat({
                  pageNumbers: {
                    ...doc.format.pageNumbers,
                    style: v as typeof doc.format.pageNumbers.style,
                  },
                })
              }
            >
              <option value="arabic">Arábigo</option>
              <option value="roman">Romano</option>
              <option value="padded">01, 02</option>
              <option value="custom-prefix">Prefijo</option>
            </NativeSelect>
          </Field>
          <Field label="Prefijo">
            <Input
              value={doc.format.pageNumbers.prefix}
              onChange={(e) =>
                setFormat({ pageNumbers: { ...doc.format.pageNumbers, prefix: e.target.value } })
              }
            />
          </Field>
        </Row>
        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
          <span className="text-xs text-muted">Mostrar números</span>
          <Switch
            checked={doc.format.pageNumbers.enabled}
            onCheckedChange={(v) =>
              setFormat({ pageNumbers: { ...doc.format.pageNumbers, enabled: v } })
            }
          />
        </div>
        <p className="text-xs font-medium tracking-wide text-muted">Márgenes (mm / px)</p>
        <div className="grid grid-cols-4 gap-2">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Field key={side} label={side === "top" ? "Sup." : side === "bottom" ? "Inf." : side === "left" ? "Izq." : "Der."}>
              <Input
                type="number"
                value={doc.format.margins[side]}
                onChange={(e) =>
                  setFormat({
                    margins: { ...doc.format.margins, [side]: Number(e.target.value) },
                  })
                }
              />
            </Field>
          ))}
        </div>
        <Row>
          <Field label="Columnas">
            <Input
              type="number"
              min={1}
              max={6}
              value={doc.format.columns}
              onChange={(e) => setFormat({ columns: Math.max(1, Number(e.target.value) || 1) })}
            />
          </Field>
          <Field label="Gutter">
            <Input
              type="number"
              min={2}
              max={24}
              value={doc.format.gutter}
              onChange={(e) => setFormat({ gutter: Number(e.target.value) })}
            />
          </Field>
        </Row>
        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
          <span className="text-xs text-muted">Guías de retícula</span>
          <Switch
            checked={doc.design.showGuides}
            onCheckedChange={(v) => setDesign({ showGuides: v })}
          />
        </div>
      </section>
    </div>
  );
}
