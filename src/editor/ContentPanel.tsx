import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { readImageFile } from "@/editorial/image";
import { useEditor } from "@/editorial/store";
import { Field, NativeSelect, Row } from "./Field";

export function ContentPanel() {
  const doc = useEditor((s) => s.doc);
  const setContent = useEditor((s) => s.setContent);
  const patchImage = useEditor((s) => s.patchImage);
  const patchBanner = useEditor((s) => s.patchBanner);

  async function onFile(
    e: ChangeEvent<HTMLInputElement>,
    target: "main" | "banner",
    bannerId?: string,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await readImageFile(file);
    if (target === "main") patchImage({ src, alt: file.name });
    else if (bannerId) patchBanner(bannerId, { imageSrc: src });
  }

  const leader = doc.content.banners.find((b) => b.id === "leaderboard")!;
  const footer = doc.content.banners.find((b) => b.id === "footer")!;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <Row>
        <Field label="Edición">
          <Input
            value={doc.content.edition}
            onChange={(e) => setContent("edition", e.target.value)}
          />
        </Field>
        <Field label="Etiqueta edición">
          <Input
            value={doc.content.editionLabel}
            onChange={(e) => setContent("editionLabel", e.target.value)}
          />
        </Field>
      </Row>
      <Field label="Fecha">
        <Input value={doc.content.date} onChange={(e) => setContent("date", e.target.value)} />
      </Field>
      <Row>
        <Field label="Emisión">
          <Input
            value={doc.content.emission}
            onChange={(e) => setContent("emission", e.target.value)}
          />
        </Field>
        <Field label="Hora">
          <Input value={doc.content.time} onChange={(e) => setContent("time", e.target.value)} />
        </Field>
      </Row>
      <Field label="Nombre del medio">
        <Input
          value={doc.content.masthead}
          onChange={(e) => setContent("masthead", e.target.value)}
        />
      </Field>
      <Field label="Titular">
        <Textarea
          value={doc.content.headline}
          onChange={(e) => setContent("headline", e.target.value)}
          className="min-h-20"
        />
      </Field>
      <Field label="Descripción / bajada">
        <Textarea
          value={doc.content.dek}
          onChange={(e) => setContent("dek", e.target.value)}
          className="min-h-24"
        />
      </Field>
      <Field label="Imagen principal">
        <Input type="file" accept="image/*" onChange={(e) => void onFile(e, "main")} />
      </Field>
      <Row>
        <Field label="Ajuste">
          <NativeSelect
            value={doc.content.image.fit}
            onChange={(v) => patchImage({ fit: v as "cover" | "contain" | "focal" })}
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="focal">Crop focalizado</option>
          </NativeSelect>
        </Field>
        <Field label="Relación">
          <Input
            value={doc.content.image.aspect}
            onChange={(e) => patchImage({ aspect: e.target.value })}
          />
        </Field>
      </Row>
      <Row>
        <Field label={`Foco X ${doc.content.image.focalX}%`}>
          <input
            type="range"
            min={0}
            max={100}
            value={doc.content.image.focalX}
            onChange={(e) => patchImage({ focalX: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </Field>
        <Field label={`Foco Y ${doc.content.image.focalY}%`}>
          <input
            type="range"
            min={0}
            max={100}
            value={doc.content.image.focalY}
            onChange={(e) => patchImage({ focalY: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </Field>
      </Row>
      <Field label="Pie de imagen">
        <Input
          value={doc.content.image.caption}
          onChange={(e) => patchImage({ caption: e.target.value })}
        />
      </Field>
      <Field label="Desarrollo (Markdown)">
        <Textarea
          value={doc.content.body}
          onChange={(e) => setContent("body", e.target.value)}
          className="min-h-48 font-mono text-xs leading-relaxed"
        />
      </Field>
      <Row>
        <Field label="Autor">
          <Input value={doc.content.author} onChange={(e) => setContent("author", e.target.value)} />
        </Field>
        <Field label="Fuente">
          <Input value={doc.content.source} onChange={(e) => setContent("source", e.target.value)} />
        </Field>
      </Row>
      <div className="rounded-lg border border-border bg-surface p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-muted">Banner de cabecera</span>
          <Switch
            checked={leader.enabled}
            onCheckedChange={(v) => patchBanner("leaderboard", { enabled: v })}
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <Field label="Título">
            <Input
              value={leader.title}
              onChange={(e) => patchBanner("leaderboard", { title: e.target.value })}
            />
          </Field>
          <Field label="Subtítulo">
            <Input
              value={leader.subtitle}
              onChange={(e) => patchBanner("leaderboard", { subtitle: e.target.value })}
            />
          </Field>
          <Field label="Diseño">
            <NativeSelect
              value={leader.kind}
              onChange={(v) => patchBanner("leaderboard", { kind: v as "image" | "institutional" })}
            >
              <option value="institutional">Institucional</option>
              <option value="image">Imagen completa</option>
            </NativeSelect>
          </Field>
          <Field label="Imagen del banner">
            <Input type="file" accept="image/*" onChange={(e) => void onFile(e, "banner", "leaderboard")} />
          </Field>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-surface p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-muted">Banner a pie de página</span>
          <Switch
            checked={footer.enabled}
            onCheckedChange={(v) => patchBanner("footer", { enabled: v })}
          />
        </div>
        <Field label="Imagen">
          <Input type="file" accept="image/*" onChange={(e) => void onFile(e, "banner", "footer")} />
        </Field>
      </div>
    </div>
  );
}
