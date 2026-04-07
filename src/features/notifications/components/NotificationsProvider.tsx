import { createSignal, JSXElement } from "solid-js";
import { NotificationsContext } from "./NotificationsContext";
import { UserNotification } from "../utils/NotificationsSchema";

export function NotificationsProvider(props: {children: JSXElement}) {
    const [notifications, setNotifications] = createSignal<UserNotification[]>([])

    return (
        <NotificationsContext.Provider
            value={{notifications, setNotifications}}
        >
            {props.children}
        </NotificationsContext.Provider>
    )
}