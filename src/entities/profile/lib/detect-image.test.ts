import { describe, expect, it } from "vitest";
import { detectImage } from "./detect-image";

const ascii = (value: string) => Array.from(value, (char) => char.charCodeAt(0));
const u16be = (value: number) => [value >> 8, value & 0xff];
const u32be = (value: number) => [...u16be(value >>> 16), ...u16be(value & 0xffff)];
const u16le = (value: number) => [value & 0xff, value >> 8];
const u24le = (value: number) => [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff];
const u32le = (value: number) => [...u24le(value), value >>> 24];

function png(width: number, height: number): Uint8Array {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return new Uint8Array([
    ...signature,
    ...u32be(13),
    ...ascii("IHDR"),
    ...u32be(width),
    ...u32be(height),
    8,
    6,
    0,
    0,
    0,
  ]);
}

// SOI, APP0 и DHT (C4 — не SOF, его нужно пропустить), затем SOF2
function jpeg(width: number, height: number): Uint8Array {
  return new Uint8Array([
    0xff,
    0xd8,
    0xff,
    0xe0,
    ...u16be(16),
    ...ascii("JFIF"),
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    0,
    0,
    0xff,
    0xc4,
    ...u16be(4),
    0,
    0,
    0xff,
    0xc2,
    ...u16be(17),
    8,
    ...u16be(height),
    ...u16be(width),
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ]);
}

function webp(chunk: string, payload: number[]): Uint8Array {
  return new Uint8Array([
    ...ascii("RIFF"),
    ...u32le(100),
    ...ascii("WEBP"),
    ...ascii(chunk),
    ...u32le(10),
    ...payload,
  ]);
}

describe("detectImage", () => {
  it("читает формат и размеры PNG", () => {
    expect(detectImage(png(800, 600))).toMatchObject({
      contentType: "image/png",
      width: 800,
      height: 600,
    });
  });

  it("читает огромные размеры из заголовка, не декодируя картинку", () => {
    expect(detectImage(png(20000, 20000))).toMatchObject({ width: 20000, height: 20000 });
  });

  it("находит размеры JPEG в сегменте SOF за другими сегментами", () => {
    expect(detectImage(jpeg(1024, 768))).toMatchObject({
      contentType: "image/jpeg",
      width: 1024,
      height: 768,
    });
  });

  it("читает размеры WebP VP8X, VP8 и VP8L", () => {
    const vp8x = webp("VP8X", [0, 0, 0, 0, ...u24le(1999), ...u24le(1499)]);
    expect(detectImage(vp8x)).toMatchObject({
      contentType: "image/webp",
      width: 2000,
      height: 1500,
    });

    // Кадр: 3 байта тега, стартовый код 9D 01 2A, ширина и высота
    const vp8 = webp("VP8 ", [0, 0, 0, 0x9d, 0x01, 0x2a, ...u16le(640), ...u16le(480)]);
    expect(detectImage(vp8)).toMatchObject({ width: 640, height: 480 });

    const bits = (512 - 1) | ((256 - 1) << 14);
    const vp8l = webp("VP8L", [0x2f, ...u32le(bits)]);
    expect(detectImage(vp8l)).toMatchObject({ width: 512, height: 256 });
  });

  it("не верит расширению и заголовку: GIF, SVG и текст — не картинки", () => {
    expect(detectImage(new Uint8Array(ascii("GIF89a\u0001\u0000\u0001\u0000")))).toBeNull();
    expect(
      detectImage(new Uint8Array(ascii("<svg xmlns='http://www.w3.org/2000/svg'/>"))),
    ).toBeNull();
    expect(detectImage(new Uint8Array(0))).toBeNull();
  });

  it("отклоняет оборванный заголовок и нулевые размеры", () => {
    expect(detectImage(png(800, 600).slice(0, 20))).toBeNull();
    expect(detectImage(jpeg(1024, 768).slice(0, 30))).toBeNull();
    expect(detectImage(png(0, 600))).toBeNull();
    const noIhdr = png(800, 600);
    noIhdr.set(ascii("IDAT"), 12);
    expect(detectImage(noIhdr)).toBeNull();
  });
});
