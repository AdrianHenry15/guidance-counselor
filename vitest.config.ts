import path from "node:path"

import { defineConfig } from "vitest/config"

/**
 * Vitest configuration for deterministic planner modules.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    clearMocks: true,
  },
})
