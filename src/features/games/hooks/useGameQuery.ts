import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/solid-query"
import { createEffect } from "solid-js"
import { GameQueryFilters } from "~/repositories/gamesRepository"
import { type getGamesFn } from "~/serverFn/games"
import { gameQueryOpts, gamesWithExtrasQueryOpts } from "../utils/gameQueryOpts"
import { developerQueryOpts } from "~/features/developers/utils/developerQueryOpts"
import { publisherQueryOpts } from "~/features/publishers/utils/publisherQueryOpts"
import { platformQueryOpts } from "~/features/platforms/utils/platformQueryOpts"

type Opts = {
    queryKey: readonly ["games", ...(string | number)[]],
    queryFn: () => ReturnType<typeof getGamesFn>
}

export function useGamesQuery(opts?: GameQueryFilters ) {
    const result = useInfiniteQuery(() => gamesWithExtrasQueryOpts(opts))
    const queryClient = useQueryClient()
    
    createEffect(() => {
        if (result.data)
            for (const game of result.data.pages.flat()) {
                queryClient.setQueryData(gameQueryOpts(game.gameId).queryKey, game)
                queryClient.setQueryData(developerQueryOpts(game.developer.developerId).queryKey, game.developer)
                queryClient.setQueryData(publisherQueryOpts(game.publisher.publisherId).queryKey, game.publisher)

                for (const platform of game.platforms) 
                    queryClient.setQueryData(platformQueryOpts(platform.platformId).queryKey, platform)
            }
    })
    return result
}