/** Прямоугольник в пикселях исходной картинки. */
export type CropArea = { x: number; y: number; width: number; height: number };

function loadImage(src: string): Promise<HTMLImageElement> {
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
 * Вырезает область картинки и сжимает её в квадрат `size`×`size`.
 * Формат — WebP, а если браузер его не кодирует (старый Safari), то JPEG.
 */
export async function cropImage(src: string, area: CropArea, size: number): Promise<Blob> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't process images");
  // Прозрачный фон PNG в JPEG стал бы чёрным
  context.fillStyle = "#fff";
  context.fillRect(0, 0, size, size);
  context.imageSmoothingQuality = "high";
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);

  const webp = await canvasToBlob(canvas, "image/webp", 0.85);
  if (webp?.type === "image/webp") return webp;

  const jpeg = await canvasToBlob(canvas, "image/jpeg", 0.9);
  if (!jpeg) throw new Error("Couldn't save the image");
  return jpeg;
}
