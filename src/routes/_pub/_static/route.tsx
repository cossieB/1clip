import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/_pub/_static')({
  headers: () => ({
    "Cache-Control": "max-age=86400, public, immutable, stale-while-revalidate=604800"
  })
})
