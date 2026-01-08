import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/publishers/$publisherId')({
    params: {
        parse: params => ({
            publisherId: Number(params.publisherId)
        })
    },
})