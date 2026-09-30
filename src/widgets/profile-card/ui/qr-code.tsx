"use client";

import { QRCodeCanvas } from "qrcode.react";
import type { Ref } from "react";

type QrCodeProps = { value: string; label: string; canvasRef: Ref<HTMLCanvasElement> };

/**
 * QR-код страницы. Чёрный на белом в обеих темах: так его читают все сканеры. 512 px — для печати.
 */
export function QrCode({ value, label, canvasRef }: QrCodeProps) {
  return (
    <QRCodeCanvas
      ref={canvasRef}
      value={value}
      size={512}
      level="M"
      marginSize={4}
      role="img"
      aria-label={label}
      className="mx-auto rounded-md"
      style={{ width: "100%", maxWidth: 240, height: "auto" }}
    />
  );
}
