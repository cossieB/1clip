import { useContext } from "solid-js";
import { NotificationsContext } from "~/features/notifications/components/NotificationsContext";

export function useNotificationContext() {
    const ctx = useContext(NotificationsContext)
    if (!ctx) throw new Error("Component should be a descendent of NotificationsProvider")
    return ctx
}