/** Картинка после перекодирования и её размеры в пикселях. */
export type EncodedImage = { blob: Blob; width: number; height: number };

// Если файл не влез в лимит, пробуем качество ниже
const QUALITY_STEPS = [0.85, 0.7, 0.55];

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Couldn't open the image"));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Холст нужного размера с белым фоном: прозрачный фон PNG в JPEG стал бы чёрным.
 * `draw` рисует картинку на контексте.
 */
export function createCanvas(
  width: number,
  height: number,
  draw: (context: CanvasRenderingContext2D) => void,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't process images");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.imageSmoothingQuality = "high";
  draw(context);
  return canvas;
}

/**
 * Сохраняет холст в WebP, а если браузер его не кодирует (старый Safari), то в JPEG. EXIF
 * исходного файла в результат не попадают. Если файл больше `maxBytes`, снижает качество;
 * не помогло — ошибка.
 */
export async function encodeCanvas(canvas: HTMLCanvasElement, maxBytes = Infinity): Promise<Blob> {
  for (const quality of QUALITY_STEPS) {
    let blob = await canvasToBlob(canvas, "image/webp", quality);
    if (blob?.type !== "image/webp") blob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (!blob) throw new Error("Couldn't save the image");
    if (blob.size <= maxBytes) return blob;
  }
  throw new Error("The image is too large even after compression");
}

/**
 * Уменьшает картинку до `maxSide` по длинной стороне (меньшие не увеличивает) и перекодирует
 * через `encodeCanvas`.
 */
export async function resizeImage(
  image: HTMLImageElement,
  maxSide: number,
  maxBytes?: number,
): Promise<EncodedImage> {
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = createCanvas(width, height, (context) =>
    context.drawImage(image, 0, 0, width, height),
  );
  return { blob: await encodeCanvas(canvas, maxBytes), width, height };
}
