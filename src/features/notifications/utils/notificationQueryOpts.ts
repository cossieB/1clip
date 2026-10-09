import { queryOptions } from "@tanstack/solid-query";
import { getNotifications } from "../notificationsApi";

export function notificationQueryOpts() {
    return queryOptions({
        queryKey: ["notifications"],
        queryFn: () => getNotifications(),
        
    })
}