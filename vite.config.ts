import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import { defineConfig } from 'vite'
import viteSolid from 'vite-plugin-solid'
import {nitro} from "nitro/vite"

export default defineConfig(({command}) => ({
  server: {
    port: 1337,
  },
  plugins: [
    nitro(),
    tanstackStart(),
    viteSolid({ ssr: true }),
  ],
  build: {
    cssCodeSplit: false // there's an issue where css files don't get loaded in prod. this option fixes that at the expense of larger css bundles
  },
  resolve: {
    tsconfigPaths: true
  }
}))
