import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import { defineConfig } from 'vite'
import viteSolid from 'vite-plugin-solid'
import {nitro} from "nitro/vite"

export default defineConfig(({command}) => ({
  server: {
    port: 1337,
  },
  plugins: [
    command === "build" ? nitro() : null,
    tanstackStart(),
    viteSolid({ ssr: true }),
  ].filter(Boolean),
  resolve: {
    tsconfigPaths: true
  }
}))
