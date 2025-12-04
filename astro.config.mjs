// @ts-check
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import path from 'path';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  vite: {
    resolve: {
      alias: {
        "@components": path.resolve('./src/shared/components'),
        "@icons": path.resolve('./src/shared/assets/icons'),
        "@styles": path.resolve('./src/styles'),
        "@features": path.resolve('./src/features'),
        "@layouts": path.resolve('./src/shared/layouts'),
        "@assets": path.resolve('./src/shared/assets'),
      },
    },
    // Optimizaciones para mejorar el HMR
    server: {
      // Mejora el file watching en Windows
      watch: {
        usePolling: false, // Cambia a true si sigue siendo lento
        interval: 100,
      },
      // Habilita HMR más rápido
      hmr: {
        overlay: true,
      },
    },
    // Pre-optimiza dependencias para carga más rápida
    optimizeDeps: {
      include: ['@supabase/supabase-js'],
      exclude: ['pg'], // Excluye dependencias del servidor
    },
    // Mejora la compilación
    build: {
      target: 'esnext',
      minify: 'esbuild', // Minificar en producción
    },
  },
});
