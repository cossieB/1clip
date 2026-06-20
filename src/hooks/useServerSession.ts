import { queryOptions } from "@tanstack/solid-query";
import { getCurrentUser } from "~/services/authService";

export function sessionQueryOpts() {
    return queryOptions({
        queryKey: ["you"],
        queryFn: () => getCurrentUser()
    })
}