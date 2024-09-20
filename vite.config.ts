import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://threepoplars.ru",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/bup/api"),
      },
    },
  },
  base: "/bup-invoice/",
});
