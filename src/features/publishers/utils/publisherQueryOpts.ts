import { queryOptions } from "@tanstack/solid-query";
import { getPublisherFn, getPublishersFn } from "~/services/publisherService";

export function publisherQueryOpts(publisherId: number) {
    return queryOptions({
        queryKey: ["publisher", publisherId],
        queryFn: () => getPublisherFn(publisherId)
    })
}

export function publishersQueryOpts() {
    return queryOptions({
        queryKey: ["publishers"],
        queryFn: () => getPublishersFn({})
    })
}