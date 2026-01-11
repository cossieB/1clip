import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/games/$gameId')({
    params: {
        parse: params => ({
            gameId: Number(params.gameId)
        })
    },
})

