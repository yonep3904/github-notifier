import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    globals: true,
    include: ["test/**/*.test.ts"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
});
