import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The API runs as its own process (server/index.js). In development the Vite
// dev server proxies /api/* to it, so the browser only ever talks to one origin.
const apiTarget = process.env.API_PROXY_TARGET || "http://localhost:4000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    // Bind mounts in containers don't always emit native file events.
    watch: { usePolling: true, interval: 300 },
    proxy: {
      "/api": { target: apiTarget, changeOrigin: true }
    }
  }
});
