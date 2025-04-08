import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills';
// https://vite.dev/config/
export default defineConfig({
  root: ".",
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react({
      babel: {
        plugins: [
          [
            "@locator/babel-jsx/dist",
            {
              env: "development",
            },
          ],
        ],
      },
    }),
    nodePolyfills(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
});
