import { queryOptions } from "@tanstack/solid-query";
import { getDeveloperFn, getDevelopersFn } from "~/serverFn/developers";

export function developerQueryOpts(developerId: number) {
    return queryOptions({
        queryKey: ["developer", developerId],
        queryFn: () => getDeveloperFn({data: developerId})
    })
}

export function developersQueryOpts() {
    return queryOptions({
        queryKey: ["developers"],
        queryFn: () => getDevelopersFn()
    })
}