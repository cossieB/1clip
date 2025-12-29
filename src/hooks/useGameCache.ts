import { useQueryClient, UseQueryResult } from "@tanstack/solid-query"
import { createEffect } from "solid-js"
import { type getGamesFn } from "~/serverFn/games"

export function useGamesCache(result: UseQueryResult<Awaited<ReturnType<typeof getGamesFn>>> ) {
    const queryClient = useQueryClient()
    createEffect(() => {
        if (result.data)
            for (const game of result.data) {
                queryClient.setQueryData(["games", game.gameId], game)
                queryClient.setQueryData(["developers", game.developer.developerId], game.developer)
                queryClient.setQueryData(["publishers", game.publisher.publisherId], game.publisher)
                queryClient.setQueryData(["publishers", game.publisher.publisherId], game.publisher)
            }
    })
}