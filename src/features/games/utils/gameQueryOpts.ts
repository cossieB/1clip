import { infiniteQueryOptions, queryOptions } from "@tanstack/solid-query";
import { getGameFn, getGamesFn, getGamesWithoutExtras } from "~/features/games/gamesApi";
import { type GameQueryFilters } from "../gamesRepository/types";

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

export function gamesQueryOpts(title?: string) {
    return queryOptions({
        queryKey: ["gamesMinimal"],
        queryFn: () => getGamesWithoutExtras({data: title})
    })
}