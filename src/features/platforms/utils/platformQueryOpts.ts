import { queryOptions } from "@tanstack/solid-query";
import { getPlatformFn, getPlatformsFn } from "~/services/platformService";

export function platformQueryOpts(platformId: number) {
    return queryOptions({
        queryKey: ["platform", platformId],
        queryFn: () => getPlatformFn(platformId)
    })
}

export function platformsQueryOpts() {
    return queryOptions({
        queryKey: ["platforms"],
        queryFn: () => getPlatformsFn(undefined),
    })
}