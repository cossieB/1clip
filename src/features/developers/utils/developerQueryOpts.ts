import { queryOptions } from "@tanstack/solid-query";
import { getDeveloperFn, getDevelopersFn } from "~/services/developerService";

export function developerQueryOpts(developerId: number) {
    return queryOptions({
        queryKey: ["developer", developerId],
        queryFn: () => getDeveloperFn(developerId)
    })
}

export function developersQueryOpts(limit = 50, offset = 0) {
    return queryOptions({
        queryKey: ["developers"],
        queryFn: () => getDevelopersFn({limit, offset})
    })
}