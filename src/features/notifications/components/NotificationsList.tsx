import { useNotifications } from "~/features/notifications/hooks/useNotificationContext";
import { For, Show } from "solid-js";
import { AtSignIcon, MailCheckIcon, MailIcon, MailOpenIcon, MessageCircleIcon, SettingsIcon, ThumbsUpIcon, UserPlusIcon } from "@lucide/solid";
import { getRelativeTime } from "~/lib/getRelativeTime";
import styles from "./Notifications.module.css"
import { Notification } from "~/drizzle/models";
import { Dynamic } from "@solidjs/web";

export function NotificationsList() {
    const { notifications, markAsRead } = useNotifications()

    return (
        <div class={styles.notifList}>
            <button
                class={styles.notification}
                onClick={() => {
                    const ids = notifications.filter(n => !n.readAt).map(n => n.notificationId)
                    if (!ids.length) return
                    markAsRead(ids)
                }}
            >
                <span class={styles.markRead} >
                    {notifications.length > 0 ? "Mark All As Read" : "No Notifications"}
                </span>
                <Show 
                    when={notifications.length > 0}
                >
                    <MailCheckIcon />
                </Show>
            </button>
            <For each={notifications}>
                {notification => <Notif notification={notification} />}
            </For>
        </div>
    )
}

const icons = {
    LIKE: ThumbsUpIcon,
    REPLY: MessageCircleIcon,
    MENTION: AtSignIcon,
    FOLLOW: UserPlusIcon,
    SYSTEM: SettingsIcon
}

type Props = {
    notification: Notification;
};

function Notif(props: Props) {
    const { markAsRead } = useNotifications()
    const markRead = () => {
        if (!props.notification.readAt)
            markAsRead([props.notification.notificationId])
    }
    return (
        <div
            class={styles.notification}
        >
            <Dynamic component={icons[props.notification.type ?? "MENTION"]} />
            <div class={styles.message}>
                {props.notification.message}
            </div>
            <span class={styles.time}>
                {getRelativeTime(props.notification.createdAt)}
            </span>
            <Show when={props.notification.actionUrl}>
                <a
                    href={props.notification.actionUrl!}
                    onClick={markRead}
                />
            </Show>
            <button
                onClick={e => {
                    e.preventDefault();
                    markRead()
                }}
            >
                <Show
                    when={!props.notification.readAt}
                    fallback={<MailOpenIcon />}
                >
                    <MailIcon />
                </Show>
            </button>
        </div>
    )
}