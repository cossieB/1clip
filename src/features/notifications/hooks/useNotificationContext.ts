import { ToastContext } from "~/components/Toast/ToastProvider";
import { markNotificationAsRead, notificationsMemo, setNotificationsMemo } from "../notificationsApi";
import { action, affects, refresh, useContext } from "solid-js";

export function useNotifications() {
    const { addToast } = useContext(ToastContext)
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
            addToast({
                text: error instanceof Error && error.message
                    ? error.message
                    : "Something went wrong. Please try again later.",
                type: "error"
            })
        }
    })

    return markAsRead
}

