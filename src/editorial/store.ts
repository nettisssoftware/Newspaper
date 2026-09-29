import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createSampleDocument,
  type DesignModel,
  type FormatModel,
  type ImageFit,
  type LayoutId,
  type NewspaperDocument,
  type PaletteId,
  type RenderModel,
  type TextAlign,
  type TypographyModel,
} from "./schema";
import { applyPreset } from "./formats";
import { compose, type Composition } from "./composition";

interface EditorState {
  doc: NewspaperDocument;
  fontsReady: boolean;
  previewStale: boolean;
  hydrated: boolean;
  setContent: <K extends keyof NewspaperDocument["content"]>(
    key: K,
    value: NewspaperDocument["content"][K],
  ) => void;
  patchImage: (patch: Partial<NewspaperDocument["content"]["image"]>) => void;
  patchBanner: (
    id: string,
    patch: Partial<NewspaperDocument["content"]["banners"][number]>,
  ) => void;
  setDesign: (patch: Partial<DesignModel>) => void;
  setTypography: (patch: Partial<TypographyModel>) => void;
  setFormat: (patch: Partial<FormatModel>) => void;
  setRender: (patch: Partial<RenderModel>) => void;
  setLayout: (id: LayoutId) => void;
  setPalette: (id: PaletteId) => void;
  setAlign: (align: TextAlign) => void;
  setImageFit: (fit: ImageFit) => void;
  setFontsReady: (ready: boolean) => void;
  markPreviewFresh: () => void;
  resetSample: () => void;
  loadDocument: (doc: NewspaperDocument) => void;
  setHydrated: (v: boolean) => void;
  composition: () => Composition;
}

function bump(doc: NewspaperDocument): NewspaperDocument {
  return { ...doc };
}

export const useEditor = create<EditorState>()(
  persist(
    (set, get) => ({
      doc: createSampleDocument(),
      fontsReady: false,
      previewStale: true,
      hydrated: false,
      setContent: (key, value) =>
        set((s) => ({
          previewStale: true,
          doc: bump({ ...s.doc, content: { ...s.doc.content, [key]: value } }),
        })),
      patchImage: (patch) =>
        set((s) => ({
          previewStale: true,
          doc: bump({
            ...s.doc,
            content: { ...s.doc.content, image: { ...s.doc.content.image, ...patch } },
          }),
        })),
      patchBanner: (id, patch) =>
        set((s) => ({
          previewStale: true,
          doc: bump({
            ...s.doc,
            content: {
              ...s.doc.content,
              banners: s.doc.content.banners.map((b) => (b.id === id ? { ...b, ...patch } : b)),
            },
          }),
        })),
      setDesign: (patch) =>
        set((s) => ({
          previewStale: true,
          doc: bump({ ...s.doc, design: { ...s.doc.design, ...patch } }),
        })),
      setTypography: (patch) =>
        set((s) => ({
          previewStale: true,
          doc: bump({ ...s.doc, typography: { ...s.doc.typography, ...patch } }),
        })),
      setFormat: (patch) =>
        set((s) => {
          const next = { ...s.doc.format, ...patch };
          if (patch.preset && patch.preset !== "custom") {
            Object.assign(next, applyPreset(patch.preset, next.orientation));
          }
          return { previewStale: true, doc: bump({ ...s.doc, format: next }) };
        }),
      setRender: (patch) =>
        set((s) => ({
          previewStale: true,
          doc: bump({ ...s.doc, render: { ...s.doc.render, ...patch } }),
        })),
      setLayout: (id) =>
        set((s) => ({
          previewStale: true,
          doc: bump({ ...s.doc, design: { ...s.doc.design, layoutId: id } }),
        })),
      setPalette: (id) =>
        set((s) => ({
          previewStale: true,
          doc: bump({ ...s.doc, design: { ...s.doc.design, paletteId: id } }),
        })),
      setAlign: (align) =>
        set((s) => ({
          previewStale: true,
          doc: bump({ ...s.doc, typography: { ...s.doc.typography, align } }),
        })),
      setImageFit: (fit) =>
        set((s) => ({
          previewStale: true,
          doc: bump({
            ...s.doc,
            content: { ...s.doc.content, image: { ...s.doc.content.image, fit } },
          }),
        })),
      setFontsReady: (ready) => set({ fontsReady: ready }),
      markPreviewFresh: () => set({ previewStale: false }),
      resetSample: () => set({ doc: createSampleDocument(), previewStale: true }),
      loadDocument: (doc) => set({ doc, previewStale: true }),
      setHydrated: (v) => set({ hydrated: v }),
      composition: () => compose(get().doc),
    }),
    {
      name: "editorial-newspaper-renderer",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          };
        }
        return localStorage;
      }),
      partialize: (s) => ({ doc: s.doc }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
