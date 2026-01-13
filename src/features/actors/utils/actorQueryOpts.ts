import { queryOptions } from "@tanstack/solid-query";
import { getActorFn, getActorsFn } from "~/serverFn/actors";

export function actorQueryOpts(actorId: number) {
    return queryOptions({
        queryKey: ["actor", actorId],
        queryFn: () => getActorFn({ data: actorId })
    })
}

export function actorsQueryOpts() {
    return queryOptions({
        queryKey: ["actors"],
        queryFn: () => getActorsFn()
    })
}