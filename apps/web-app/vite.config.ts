import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
      process: "process",
      stream: "stream-browserify",
      util: "util",
      crypto: "crypto-browserify",

      "unenv/node/buffer": "buffer",
      "unenv/node/process": "process",
      "unenv/node/util": "util",
    },
  },

  define: {
    global: "globalThis",
    // process: "process",
  },
});
