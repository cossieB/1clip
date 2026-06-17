import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { solidStart } from "@solidjs/start/config";
import "dotenv/config"

export default defineConfig({
  server: {
    port: 1337,
  },
  plugins: [
    solidStart({
      middleware: "src/middleware/index.ts",
      ssr: true
    }),
    nitro({
      preset: "node-server"
    })
  ]
});
