import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/_pub/_posts')({
    headers: () => ({
        "Cache-Control": "max-age=3600, private"
    })
})
