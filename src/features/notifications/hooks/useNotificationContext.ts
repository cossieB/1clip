import { getNotifications, markNotificationAsRead } from "../notificationsApi";
import { action, createMemo, createOptimisticStore } from "solid-js";

export function useNotifications() {
    
    const [notifications, setNotifications] = createOptimisticStore(() => getNotifications(), [])
    const markAsRead = action(function*(ids: number[]) {
        setNotifications(s => {
            for (const id of ids) {
                const notif = s.find(n => n.notificationId == id)
                if (!notif) continue;
                notif.readAt = new Date()
            }
        })
        yield markNotificationAsRead(ids)        
    })


    return {notifications, markAsRead}
}

