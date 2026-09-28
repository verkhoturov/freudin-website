import {
  DOCUMENT_MAX_BYTES,
  DOCUMENT_MAX_DIMENSION,
  DOCUMENT_THUMBNAIL_MAX_BYTES,
  DOCUMENT_THUMBNAIL_SIZE,
} from "@/entities/profile";
import { type EncodedImage, loadImage, resizeImage } from "@/shared/lib/canvas-image";

export type DocumentImages = { file: EncodedImage; thumbnail: EncodedImage };

/**
 * Изображение документа (до `DOCUMENT_MAX_DIMENSION`) и превью (до `DOCUMENT_THUMBNAIL_SIZE`)
 * из выбранного файла. Картинки перерисовываются через canvas, поэтому EXIF с геолокацией
 * и данными камеры на сервер не попадают.
 */
export async function prepareDocumentImages(file: Blob): Promise<DocumentImages> {
  const src = URL.createObjectURL(file);
  try {
    const image = await loadImage(src);
    const full = await resizeImage(image, DOCUMENT_MAX_DIMENSION, DOCUMENT_MAX_BYTES);
    const thumbnail = await resizeImage(
      image,
      DOCUMENT_THUMBNAIL_SIZE,
      DOCUMENT_THUMBNAIL_MAX_BYTES,
    );
    return { file: full, thumbnail };
  } finally {
    URL.revokeObjectURL(src);
  }
}
