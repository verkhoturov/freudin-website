import { createCanvas, encodeCanvas, loadImage } from "./canvas-image";

/** Прямоугольник в пикселях исходной картинки. */
export type CropArea = { x: number; y: number; width: number; height: number };

/**
 * Вырезает область картинки и сжимает её в квадрат `size`×`size`.
 * Формат — WebP, а если браузер его не кодирует (старый Safari), то JPEG.
 */
export async function cropImage(src: string, area: CropArea, size: number): Promise<Blob> {
  const image = await loadImage(src);
  const canvas = createCanvas(size, size, (context) =>
    context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size),
  );
  return encodeCanvas(canvas);
}
