import { FONT_CATALOG, loadCatalogPreviewFonts } from "@/editorial/fonts";
import { useEditor } from "@/editorial/store";
import { useEffect } from "react";
import { Field, NativeSelect, Row } from "./Field";

export function TypePanel() {
  const doc = useEditor((s) => s.doc);
  const setTypography = useEditor((s) => s.setTypography);
  const setAlign = useEditor((s) => s.setAlign);

  useEffect(() => {
    loadCatalogPreviewFonts();
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-8">
      <Field label="Fuente de titular">
        <NativeSelect
          value={doc.typography.displayFamily}
          onChange={(v) => setTypography({ displayFamily: v })}
        >
          {FONT_CATALOG.map((f) => (
            <option key={f.id} value={f.family} style={{ fontFamily: f.family }}>
              {f.family}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Fuente de cuerpo">
        <NativeSelect
          value={doc.typography.bodyFamily}
          onChange={(v) => setTypography({ bodyFamily: v })}
        >
          {FONT_CATALOG.map((f) => (
            <option key={f.id} value={f.family}>
              {f.family}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <div
        className="rounded-md border border-border bg-surface px-3 py-3"
        style={{ fontFamily: `"${doc.typography.displayFamily}", serif` }}
      >
        <p className="text-lg leading-tight text-fg">La ciudad recuerda</p>
        <p
          className="mt-1 text-sm text-muted"
          style={{ fontFamily: `"${doc.typography.bodyFamily}", serif` }}
        >
          Prueba de cuerpo con acentos: año, niño, región.
        </p>
      </div>
      <Field label="Alineación">
        <NativeSelect value={doc.typography.align} onChange={(v) => setAlign(v as typeof doc.typography.align)}>
          <option value="left">Izquierda</option>
          <option value="right">Derecha</option>
          <option value="center">Centro</option>
          <option value="justify">Justificado</option>
        </NativeSelect>
      </Field>
      <Row>
        <Field label={`Peso titular ${doc.typography.displayWeight}`}>
          <input
            type="range"
            min={400}
            max={900}
            step={100}
            value={doc.typography.displayWeight}
            onChange={(e) => setTypography({ displayWeight: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </Field>
        <Field label={`Peso bajada ${doc.typography.dekWeight}`}>
          <input
            type="range"
            min={400}
            max={700}
            step={100}
            value={doc.typography.dekWeight}
            onChange={(e) => setTypography({ dekWeight: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </Field>
      </Row>
      <Row>
        <Field label={`Peso cuerpo ${doc.typography.bodyWeight}`}>
          <input
            type="range"
            min={400}
            max={600}
            step={100}
            value={doc.typography.bodyWeight}
            onChange={(e) => setTypography({ bodyWeight: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </Field>
        <Field label={`Escala titular ${doc.typography.displayScale.toFixed(2)}`}>
          <input
            type="range"
            min={0.7}
            max={1.4}
            step={0.02}
            value={doc.typography.displayScale}
            onChange={(e) => setTypography({ displayScale: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </Field>
      </Row>
      <Row>
        <Field label={`Escala bajada ${doc.typography.dekScale.toFixed(2)}`}>
          <input
            type="range"
            min={0.7}
            max={1.4}
            step={0.02}
            value={doc.typography.dekScale}
            onChange={(e) => setTypography({ dekScale: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </Field>
        <Field label={`Escala cuerpo ${doc.typography.bodyScale.toFixed(2)}`}>
          <input
            type="range"
            min={0.8}
            max={1.3}
            step={0.02}
            value={doc.typography.bodyScale}
            onChange={(e) => setTypography({ bodyScale: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </Field>
      </Row>
      <Row>
        <Field label={`Leading ${doc.typography.leading.toFixed(2)}`}>
          <input
            type="range"
            min={1.2}
            max={1.8}
            step={0.02}
            value={doc.typography.leading}
            onChange={(e) => setTypography({ leading: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </Field>
        <Field label={`Tracking cuerpo ${doc.typography.letterSpacing.toFixed(3)}`}>
          <input
            type="range"
            min={-0.03}
            max={0.06}
            step={0.005}
            value={doc.typography.letterSpacing}
            onChange={(e) => setTypography({ letterSpacing: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </Field>
      </Row>
      <Field label={`Tracking titular ${doc.typography.headlineTracking.toFixed(3)}`}>
        <input
          type="range"
          min={-0.03}
          max={0.08}
          step={0.002}
          value={doc.typography.headlineTracking}
          onChange={(e) => setTypography({ headlineTracking: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </Field>
    </div>
  );
}
