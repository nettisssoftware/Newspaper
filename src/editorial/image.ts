export async function readImageFile(file: File): Promise<string> {
  const raw = await fileToDataUrl(file);
  return compressDataUrl(raw, 2400, 0.88);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function compressDataUrl(src: string, maxEdge: number, quality: number): Promise<string> {
  if (src.startsWith("/") || src.startsWith("http")) return src;
  const img = await loadHtmlImage(src);
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  if (scale >= 0.98 && src.startsWith("data:image/jpeg")) return src;
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = src;
  });
}

export function objectFitCss(fit: "cover" | "contain" | "focal"): "cover" | "contain" {
  return fit === "contain" ? "contain" : "cover";
}
