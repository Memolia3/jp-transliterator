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
      external: [/^__tests__/],
      input: {
        index: resolve(__dirname, "src/index.ts"),
      },
      output: {
        preserveModules: true
      }
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
