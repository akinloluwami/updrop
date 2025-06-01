import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
// eslint-disable-next-line import/no-unresolved
import tailwindcss from "@tailwindcss/vite";

// eslint-disable-next-line import/no-unresolved
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
