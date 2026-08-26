import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "site",
  base: "./",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve("site/index.html"),
        guide: resolve("site/guide.html"),
      },
    },
  },
});
