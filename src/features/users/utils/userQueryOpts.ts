import { queryOptions } from "@tanstack/solid-query";
import { getUserByIdFn } from "~/services/userService";

export function userQueryOpts(userId: string) {
    return queryOptions({
        queryKey: ["users", userId],
        queryFn: () => getUserByIdFn(userId)
    })
}