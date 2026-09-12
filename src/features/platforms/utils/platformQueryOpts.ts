import { queryOptions } from "@tanstack/solid-query";
import { getPlatformFn, getPlatformsFn } from "../platformsApi";

export function platformQueryOpts(platformId: number) {
    return queryOptions({
        queryKey: ["platform", platformId],
        queryFn: () => getPlatformFn({ data: platformId })
    })
}

export function platformsQueryOpts() {
    return queryOptions({
        queryKey: ["platforms"],
        queryFn: () => getPlatformsFn(),
    })
}