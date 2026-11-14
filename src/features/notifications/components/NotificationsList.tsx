import { useNotifications } from "~/features/notifications/hooks/useNotificationContext";
import { For, isPending, Loading, Show } from "solid-js";
import { AtSignIcon, HandshakeIcon, MailCheckIcon, MailIcon, MailOpenIcon, MessageCircleIcon, SettingsIcon, ThumbsUpIcon, UserPlusIcon } from "@lucide/solid";
import { getRelativeTime } from "~/lib/getRelativeTime";
import styles from "./Notifications.module.css"
import { Notification } from "~/drizzle/models";
import { Dynamic } from "@solidjs/web";
import { notificationsMemo } from "../notificationsApi";

export function NotificationsList() {
    const markAsRead = useNotifications()

    return (
        <div class={styles.notifList}>
            <Loading>

                <button
                    class={styles.notification}
                    onClick={() => {
                        const ids = notificationsMemo.filter(n => !n.readAt).map(n => n.notificationId)
                        if (!ids.length) return
                        markAsRead(ids)
                    }}
                >
                    <span class={styles.markRead} >
                        {notificationsMemo.length > 0 ? "Mark All As Read" : "No Notifications"}
                    </span>
                    <Show
                        when={notificationsMemo.length > 0}
                    >
                        <MailCheckIcon />
                    </Show>
                </button>
                <For each={notificationsMemo}>
                    {notification => <Notif notification={notification} />}
                </For>
            </Loading>
        </div>
    )
}

const icons = {
    LIKE: ThumbsUpIcon,
    REPLY: MessageCircleIcon,
    MENTION: AtSignIcon,
    FOLLOW: UserPlusIcon,
    SYSTEM: SettingsIcon,
    SQUAD: HandshakeIcon
}

type Props = {
    notification: Notification & {pending?: boolean};
};

function Notif(props: Props) {
    const markAsRead = useNotifications()
    const markRead = () => {
        if (!props.notification.readAt)
            markAsRead([props.notification.notificationId])
    }
    return (
        <div
            class={styles.notification}
        >
            <Dynamic component={icons[props.notification.type ?? "SYSTEM"]} />
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
                style={{
                    opacity: props.notification.pending ? 0.5 : undefined
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