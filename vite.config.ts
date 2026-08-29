import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      "@": decodeURIComponent(new URL("./src", import.meta.url).pathname),
    },
  },
});
