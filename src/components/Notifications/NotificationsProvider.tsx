import { createSignal, JSXElement } from "solid-js";
import { NotificationsContext } from "./NotificationsContext";
import { NotifMessage } from "~/integrations/notificationService/notificationService.interface";

export function NotificationsProvider(props: {children: JSXElement}) {
    const [notifications, setNotifications] = createSignal<NotifMessage[]>([])
    return (
        <NotificationsContext.Provider
            value={{notifications, setNotifications}}
        >
            {props.children}
        </NotificationsContext.Provider>
    )
}