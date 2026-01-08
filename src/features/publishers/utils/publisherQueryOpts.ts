import { queryOptions } from "@tanstack/solid-query";
import { getPublisherFn } from "~/serverFn/publishers";

export function publisherQueryOpts(publisherId: number) {
    return queryOptions({
        queryKey: ["publishers", publisherId],
        queryFn: () => getPublisherFn({ data: publisherId })
    })
}