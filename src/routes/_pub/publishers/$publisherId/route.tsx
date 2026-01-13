import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/_pub/publishers/$publisherId')({
    params: {
        parse: params => ({
            publisherId: Number(params.publisherId)
        })
    },
})