import type { NextConfig } from "next";

// Заголовки защиты для всех ответов (шаг 67.1). CSP без script-src: встроенным скриптам Next
// нужны nonce, а их выдаёт только proxy.ts (нужно согласие пользователя). Здесь — запрет
// встраивания сайта в чужие страницы (clickjacking), плагинов и подмены базового адреса
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  images: {
    remotePatterns: process.env.SUPABASE_URL
      ? ["avatars", "documents"].map((bucket) => {
          const origin = new URL(process.env.SUPABASE_URL as string);
          return {
            protocol: origin.protocol.slice(0, -1) as "https" | "http",
            hostname: origin.hostname,
            port: origin.port,
            pathname: `/storage/v1/object/public/${bucket}/**`,
            search: "",
          };
        })
      : [],
    imageSizes: [32, 48, 64, 96, 128, 192, 256, 384],
    maximumRedirects: 0,
  },
};

export default nextConfig;
