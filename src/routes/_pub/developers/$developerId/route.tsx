import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/_pub/developers/$developerId')({
    params: {
        parse: params => ({
            developerId: Number(params.developerId)
        })
    },
})
