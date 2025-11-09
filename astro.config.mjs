// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from 'node:url';

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        "@components": fileURLToPath(
          new URL("./src/shared/components", import.meta.url)
        ),
        "@icons": fileURLToPath(
          new URL("./src/shared/assets/icons", import.meta.url)
        ),
        "@styles": fileURLToPath(
          new URL("./src/styles", import.meta.url)
        ),
        "@features": fileURLToPath(
          new URL("./src/features", import.meta.url)
        ),
        "@layouts": fileURLToPath(
          new URL("./src/shared/layouts", import.meta.url)
        ),
        "@assets": fileURLToPath(
          new URL("./src/shared/assets", import.meta.url)
        ),
      },
    },
  },
});
