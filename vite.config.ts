import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "./dist",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      input: resolve(__dirname, "src/index.ts"),
      output: {
        format: "es",
        exports: "named",
      },
      external: (id) => id.includes('__tests__') || id.includes('.test.') || id.includes('.spec.'),
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    exclude: ["**/__tests__/**"],
  },
});
