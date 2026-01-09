import { queryOptions } from "@tanstack/solid-query";
import { getActorFn } from "~/serverFn/actors";

export function actorQueryOpts(actorId: number) {
    return queryOptions({
        queryKey: ["actor", actorId],
        queryFn: () => getActorFn({ data: actorId })
    })
}