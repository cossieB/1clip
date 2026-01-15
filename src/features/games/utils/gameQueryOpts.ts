import { infiniteQueryOptions, queryOptions } from "@tanstack/solid-query";
import {type GameQueryFilters } from "~/repositories/gamesRepository";
import { getGameFn, getGamesFn, getGamesWithoutExtras } from "~/serverFn/games";

export function gamesWithExtrasQueryOpts(filters?: GameQueryFilters) {
    return infiniteQueryOptions({
        queryKey: ["games", filters],
        queryFn: (key) => getGamesFn({ data: {...filters, cursor: key.pageParam} }),
        getNextPageParam: (lastPage, pages) => lastPage.at(-1)?.gameId,
        initialPageParam: undefined as number | undefined
    })
}

export function gameQueryOpts(gameId: number) {
    return queryOptions({
        queryKey: ["game", gameId],
        queryFn: () => getGameFn({data: gameId})
    })
}

export function gamesQueryOpts() {
    return queryOptions({
        queryKey: ["allGames"],
        queryFn: () => getGamesWithoutExtras()
    })
}