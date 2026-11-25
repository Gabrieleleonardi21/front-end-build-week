import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// BASE_PATH: percorso pubblico in produzione (GitHub Pages serve il sito sotto /front-end-build-week/).
// In sviluppo locale resta "/".
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH ?? "/",
});
