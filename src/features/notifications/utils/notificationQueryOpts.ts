import { queryOptions } from "@tanstack/solid-query";
import { getNotifications } from "../notifications";

export function notificationQueryOpts() {
    return queryOptions({
        queryKey: ["notifications"],
        queryFn: () => getNotifications(),
        
    })
}