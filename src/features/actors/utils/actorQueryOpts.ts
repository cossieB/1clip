import { queryOptions } from "@tanstack/solid-query";
import { getActorFn, getActorsFn, getActorsWithCharacters } from "~/serverFn/actors";

export function actorQueryOpts(actorId: number) {
    return queryOptions({
        queryKey: ["actor", actorId],
        queryFn: () => getActorFn({ data: actorId })
    })
}

export function actorsQueryOpts(limit = 50, offset = 0) {
    return queryOptions({
        queryKey: ["actors"],
        queryFn: () => getActorsFn({data: {limit, offset}})
    })
}

export function actorWithGamesQueryOpts(actorId: number) {
    return queryOptions({
        queryKey: ["actor", actorId, 'withGames'],
        queryFn: () => getActorsWithCharacters({data: actorId})
    })
}