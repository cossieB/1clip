import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/admin/publishers/$publisherId')({
    params: {
        parse: params => ({
            publisherId: Number(params.publisherId)
        })
    },
})