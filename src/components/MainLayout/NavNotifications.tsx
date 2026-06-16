import { BellIcon } from "lucide-solid"
import { Show } from "solid-js"
import { useNotificationContext } from "~/features/notifications/hooks/useNotificationContext"
import { NotificationsSchema } from "~/features/notifications/utils/NotificationsSchema"
import { useLocalStorage } from "~/hooks/useLocalStorage"
import { NavItem } from "./NavItem"
import styles from "./MainLayout.module.css"

export default function NavNotifications() {
    const { notifications, setNotifications } = useNotificationContext()
    const stream = new EventSource("/api/notifications")
    const {getItem, setItem} = useLocalStorage("notifications", NotificationsSchema.array())
    
    stream.onmessage = (event: MessageEvent) => {
        const oldNotifications = getItem() ?? []
        const data = JSON.parse(event.data)
        setNotifications(prev => [...prev, data])
        setItem([...oldNotifications, data].slice(0, 50).reverse())
    }
    return (
        <div class={styles.notifs}>
            <NavItem
                href="/notifications"
                icon={<BellIcon />}
                label="Notifications"
            />
            <Show when={notifications().length > 0}>
                <span class={styles.notifNum}>
                    {Math.min(notifications().length, 9)}
                </span>
            </Show>
        </div>
    )
}