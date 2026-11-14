import { BellIcon } from "@lucide/solid"
import { createMemo, Loading, refresh, Show } from "solid-js"
import { notificationsMemo } from "../notificationsApi"
import { paths } from "~/router"

export function NavNotifications() {
    const unread = createMemo(() => notificationsMemo.filter(n => !n.readAt).length)
    const stream = new EventSource("/api/notifications")
        
    stream.onmessage = (event: MessageEvent) => {
        refresh(notificationsMemo)
    }    
    return (
        <a href={paths.notifications()}>
            <BellIcon />
            <span>Alerts</span>
            <Loading>
                <Show when={unread() > 0}>
                    <b class="badge info"> {unread()} </b>
                </Show>
            </Loading>
        </a>
    )
}