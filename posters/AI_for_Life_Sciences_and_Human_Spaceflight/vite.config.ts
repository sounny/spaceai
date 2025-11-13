import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/poster-ai-health/",
  root: path.resolve(__dirname, "client"),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"), // 👈 alias "@"
      "@assets": path.resolve(__dirname, "client", "src", "assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "server", "public"),
    emptyOutDir: true,
  },
});

