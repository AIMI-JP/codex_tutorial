import { defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    port: 1420,
    strictPort: true
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"]
    }
  }
});
