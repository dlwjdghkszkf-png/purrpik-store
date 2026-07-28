import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // 'server-only'는 런타임 가드용 빈 모듈 — 유닛 테스트에선 no-op으로 대체.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
});
