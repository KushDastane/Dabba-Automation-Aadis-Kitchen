import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // ✅ PWA plugin
    VitePWA({
      registerType: "autoUpdate",

      // assets already in public/
      includeAssets: [
        "icon/pwa-192.png",
        "icon/pwa-512.png",
        "icon/tiffin.png",
      ],

      manifest: {
        name: "Aadi's Kitchen",
        short_name: "Aadi's",
        description: "Fresh home-style tiffin service",
        start_url: "/",
        display: "standalone",
        background_color: "#faf9f6",
        theme_color: "#facc15",

        icons: [
          {
            src: "/icon/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
