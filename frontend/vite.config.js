import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Vercel sirve la aplicación desde la raíz del dominio.
  base: "/",
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
