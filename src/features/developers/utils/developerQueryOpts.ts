import { queryOptions } from "@tanstack/solid-query";
import { getDeveloperFn, getDevelopersFn } from "~/serverFn/developers";

export function developerQueryOpts(developerId: number) {
    return queryOptions({
        queryKey: ["developer", developerId],
        queryFn: () => getDeveloperFn({data: developerId})
    })
}

export function developersQueryOpts(limit = 50, offset = 0) {
    return queryOptions({
        queryKey: ["developers"],
        queryFn: () => getDevelopersFn({data: {limit, offset}})
    })
}