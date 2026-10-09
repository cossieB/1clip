import { useQuery } from "@tanstack/solid-query";
import { authClient } from "~/auth/authClient";
import { notificationQueryOpts } from "../utils/notificationQueryOpts";
import { useServerFn } from "@tanstack/solid-start";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { markNotificationAsRead } from "../notificationsApi";

export function useNotifications() {
    const session = authClient.useSession()
    const markAsRead = useServerFn(markNotificationAsRead)
    const queryClient = useQueryClient()

    const markAsReadMutation = useMutation(() => ({
        mutationFn: markAsRead,
        onSuccess(_data, variables, a, b) {
            queryClient.setQueryData(notificationQueryOpts().queryKey, prev => {
                if (!prev) return undefined
                return prev.map(x => ({
                    ...x,
                    readAt: variables.data.includes(x.notificationId) ? new Date : x.readAt
                }))
            })
        }
    }))
    const notifications = useQuery(() => ({
        ...notificationQueryOpts(),
        enabled: !!session().data?.user.id,
    }))

    return {notifications, markAsRead: markAsReadMutation}
}

