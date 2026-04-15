import { useNotificationContext } from "~/features/notifications/hooks/useNotificationContext";
import { For } from "solid-js";
import { MessageCircleIcon, ThumbsUpIcon, UsersIcon } from "lucide-solid";
import { Dynamic } from "solid-js/web";
import { getRelativeTime } from "~/lib/getRelativeTime";
import styles from "./Notifications.module.css"
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { NotificationsSchema, UserNotification } from "../utils/NotificationsSchema";
import { Link } from "@tanstack/solid-router";

export function NotificationsList() {
    const { notifications } = useNotificationContext()
    const {getItem} = useLocalStorage("notifications", NotificationsSchema.array())
    const oldNotifications = getItem() ?? []
    return (
        <div class={styles.notifList}>
            <For each={notifications().toReversed()}>
                {notification => <Notif notification={notification} />}
            </For>
            <For each={oldNotifications} >
                {notification => <Notif notification={notification} />}
            </For>
        </div>
    )
}

const icons = {
    LIKE: ThumbsUpIcon,
    REPLY: MessageCircleIcon,
    FOLLOW: UsersIcon
}
function Notif(props: { notification: UserNotification }) {
    return (
        <div class={styles.notification}>
            <Dynamic component={icons[props.notification.type]} />
            <div>
                {props.notification.message}
            </div>
            <span>
                {getRelativeTime(new Date(props.notification.date))}
            </span>
            <Link to={props.notification.link} />
        </div>
    )
}