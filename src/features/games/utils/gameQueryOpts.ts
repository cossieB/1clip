import { queryOptions } from "@tanstack/solid-query";
import {type GameQueryFilters } from "~/repositories/gamesRepository";
import { getGameFn, getGamesFn } from "~/serverFn/games";

export function gamesQueryOpts(filters?: GameQueryFilters) {
    return queryOptions({
        queryKey: ["games", filters],
        queryFn: () => getGamesFn({ data: filters })
    })
}

export function gameQueryOpts(gameId: number) {
    return queryOptions({
        queryKey: ["game", gameId],
        queryFn: () => getGameFn({data: gameId})
    })
}