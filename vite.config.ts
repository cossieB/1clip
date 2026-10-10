/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import viteSolid from 'vite-plugin-solid'
import { nitro } from "nitro/vite"
import dotenv from 'dotenv';
import path from 'node:path';
import { configDefaults } from 'vitest/config';

const environment = process.env.NODE_ENV || 'development';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${environment}`)
});

export default defineConfig(({ command }) => ({

  server: {
    port: 1337,
    strictPort: process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test"
  },
  plugins: [
    nitro(),
    tanstackStart({
      importProtection: {
        client: {
          files: ["src/repositories/**", "src/drizzle/**"],
        },
        behavior: {
          dev: "error"
        }
      }
    }),
    viteSolid({ ssr: true }),
  ],
  build: {
    cssCodeSplit: false // there's an issue where css files don't get loaded in prod. this option fixes that at the expense of larger css bundles
  },
  resolve: {
    tsconfigPaths: true
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],

    exclude: [
      ...configDefaults.exclude,
      "e2e/**"
    ],
  }
}))
