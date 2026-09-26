import type { AvatarMimeType } from "../config/storage";

export type ImageSize = { width: number; height: number };

function readFourCC(view: DataView, offset: number): string {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

function readUint24LE(view: DataView, offset: number): number {
  return (
    view.getUint8(offset) | (view.getUint8(offset + 1) << 8) | (view.getUint8(offset + 2) << 16)
  );
}

// Сразу после сигнатуры идёт чанк IHDR: ширина и высота по 4 байта
function readPngSize(view: DataView): ImageSize | null {
  if (readFourCC(view, 12) !== "IHDR") return null;
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

// Размеры лежат в сегменте SOF: FF Cx, длина, точность, высота, ширина
function readJpegSize(view: DataView): ImageSize | null {
  let offset = 2;
  while (offset + 9 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) return null;
    const marker = view.getUint8(offset + 1);
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    // TEM, RSTn, SOI и EOI без длины
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }
    // C4 (DHT), C8 (JPG) и CC (DAC) — не SOF, хотя попадают в тот же диапазон
    const isFrameHeader = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrameHeader) {
      return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
    }
    offset += 2 + view.getUint16(offset + 2);
  }
  return null;
}

// Первый чанк после RIFF…WEBP: VP8X (расширенный), VP8 (с потерями) или VP8L (без потерь)
function readWebpSize(view: DataView): ImageSize | null {
  switch (readFourCC(view, 12)) {
    case "VP8X":
      return { width: 1 + readUint24LE(view, 24), height: 1 + readUint24LE(view, 27) };
    case "VP8 ":
      return {
        width: view.getUint16(26, true) & 0x3fff,
        height: view.getUint16(28, true) & 0x3fff,
      };
    case "VP8L": {
      const bits = view.getUint32(21, true);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) };
    }
    default:
      return null;
  }
}

/**
 * Ширина и высота картинки из заголовка файла, без декодирования. `null` — заголовок
 * не прочитать или размер нулевой.
 */
export function readImageSize(bytes: Uint8Array, contentType: AvatarMimeType): ImageSize | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let size: ImageSize | null;
  try {
    if (contentType === "image/png") size = readPngSize(view);
    else if (contentType === "image/jpeg") size = readJpegSize(view);
    else size = readWebpSize(view);
  } catch {
    // Файл оборвался посреди заголовка: DataView бросает RangeError
    return null;
  }
  return size && size.width > 0 && size.height > 0 ? size : null;
}
