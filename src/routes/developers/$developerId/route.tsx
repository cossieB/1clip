import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/developers/$developerId')({
    params: {
        parse: params => ({
            developerId: Number(params.developerId)
        })
    },
})
