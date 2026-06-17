import { queryOptions } from "@tanstack/solid-query";
import { getActorFn, getActorsFn, getActorsWithCharactersFn } from "~/services/actorsService";

export function actorQueryOpts(actorId: number) {
    return queryOptions({
        queryKey: ["actor", actorId],
        queryFn: () => getActorFn(actorId)
    })
}

export function actorsQueryOpts(limit = 50, offset = 0) {
    return queryOptions({
        queryKey: ["actors"],
        queryFn: () => getActorsFn({limit, offset})
    })
}

export function actorWithGamesQueryOpts(actorId: number) {
    return queryOptions({
        queryKey: ["actor", actorId, 'withGames'],
        queryFn: () => getActorsWithCharactersFn(actorId)
    })
}