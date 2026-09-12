import { queryOptions } from "@tanstack/solid-query";
import { getUserByIdFn } from "~/features/users/usersApi";

export function userQueryOpts(userId: string) {
    return queryOptions({
        queryKey: ["users", userId],
        queryFn: () => getUserByIdFn({data: userId})
    })
}