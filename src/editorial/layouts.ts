import type { LayoutId } from "./schema";

export interface LayoutDefinition {
  id: LayoutId;
  number: string;
  name: string;
  description: string;
  image: "top" | "left" | "right" | "center" | "column" | "dominant" | "module";
  defaultBodyColumns: number;
}

export const LAYOUTS: LayoutDefinition[] = [
  {
    id: "image-top",
    number: "01",
    name: "Imagen superior",
    description: "Titular, bajada, fotografía horizontal y desarrollo en columnas.",
    image: "top",
    defaultBodyColumns: 2,
  },
  {
    id: "image-left",
    number: "02",
    name: "Imagen izquierda",
    description: "Fotografía flotante a la izquierda; el texto nace a su derecha y continúa debajo.",
    image: "left",
    defaultBodyColumns: 1,
  },
  {
    id: "image-right",
    number: "03",
    name: "Imagen derecha",
    description: "Fotografía flotante a la derecha; el texto nace a su izquierda.",
    image: "right",
    defaultBodyColumns: 1,
  },
  {
    id: "image-center",
    number: "04",
    name: "Imagen central",
    description: "Imagen centrada con cuerpo en varias columnas debajo.",
    image: "center",
    defaultBodyColumns: 2,
  },
  {
    id: "editorial-2col",
    number: "05",
    name: "Editorial de dos columnas",
    description: "Titular a todo el ancho; imagen integrada en una columna.",
    image: "column",
    defaultBodyColumns: 2,
  },
  {
    id: "editorial-3col",
    number: "06",
    name: "Editorial de tres columnas",
    description: "Imagen destacada y desarrollo en tres columnas con gutters uniformes.",
    image: "top",
    defaultBodyColumns: 3,
  },
  {
    id: "image-dominant",
    number: "07",
    name: "Imagen dominante",
    description: "Fotografía de gran tamaño, titular asociado y desarrollo reducido.",
    image: "dominant",
    defaultBodyColumns: 3,
  },
  {
    id: "modular",
    number: "08",
    name: "Modular",
    description: "Módulos de imagen y texto alineados a la retícula.",
    image: "module",
    defaultBodyColumns: 2,
  },
];

export function layoutById(id: LayoutId): LayoutDefinition {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0]!;
}

export function bodyColumnsFor(id: LayoutId, formatColumns: number): number {
  const def = layoutById(id);
  if (id === "editorial-3col" || id === "image-dominant") {
    return Math.max(2, Math.min(4, formatColumns === 1 ? 3 : formatColumns));
  }
  if (id === "image-left" || id === "image-right") return 1;
  if (id === "editorial-2col" || id === "modular") return 2;
  return Math.max(1, Math.min(4, formatColumns));
}
