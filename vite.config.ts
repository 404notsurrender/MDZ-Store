import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Also expose Vercel-Supabase integration vars (NEXT_PUBLIC_*) to the browser build.
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({ server: { entry: "server" } }),
    nitro(),
    viteReact(),
  ],
  build: { cssMinify: "esbuild" },
});
