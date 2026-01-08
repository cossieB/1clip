import { queryOptions } from "@tanstack/solid-query";
import { getDeveloperFn } from "~/serverFn/developers";

export function developerQueryOpts(developerId: number) {
    return queryOptions({
        queryKey: ["developers", developerId],
        queryFn: () => getDeveloperFn({data: developerId})
    })
}