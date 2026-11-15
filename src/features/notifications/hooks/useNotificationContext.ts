import { markNotificationAsRead, notificationsMemo, setNotificationsMemo } from "../notificationsApi";
import { action, affects, refresh } from "solid-js";
import { useToastError } from "~/hooks/useToastError";

export function useNotifications() {
    const toastError = useToastError()
    const markAsRead = action(function* (ids: number[]) {
        affects(notificationsMemo)
        setNotificationsMemo(s => {
            for (const id of ids) {
                const notif = s.find(n => n.notificationId == id)
                if (!notif) continue;
                notif.readAt = new Date();
                (notif as any).pending = true
            }
        })
        try {
            yield markNotificationAsRead(ids)
            refresh(notificationsMemo)
        }
        catch (error) {
            toastError(error)
        }
    })

    return markAsRead
}

