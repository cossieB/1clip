import { queryOptions } from "@tanstack/solid-query";
import { getPublisherFn, getPublishersFn } from "~/serverFn/publishers";

export function publisherQueryOpts(publisherId: number) {
    return queryOptions({
        queryKey: ["publisher", publisherId],
        queryFn: () => getPublisherFn({ data: publisherId })
    })
}

export function publishersQueryOpts() {
    return queryOptions({
        queryKey: ["publishers"],
        queryFn: () => getPublishersFn()
    })
}