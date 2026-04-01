import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import { defineConfig } from 'vite'
import viteSolid from 'vite-plugin-solid'
import {nitro} from "nitro/vite"

export default defineConfig({
  server: {
    port: 1337,
  },
  plugins: [
    nitro(),
    tanstackStart(),
    viteSolid({ ssr: true }),
  ],
  resolve: {
    tsconfigPaths: true
  }
})
