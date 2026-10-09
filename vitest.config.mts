import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Юнит-тесты чистой логики (шаг 24): окружение node, без DOM и React
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // Метка серверного модуля бросает ошибку вне сборки Next: в тестах она не нужна
    alias: {
      "server-only": fileURLToPath(new URL("node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
