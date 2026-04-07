import { Accessor, createContext, Setter, Signal } from "solid-js";
import { UserNotification } from "../utils/NotificationsSchema";

type NotificationsCtx = {
    notifications: Accessor<UserNotification[]>
    setNotifications: Setter<UserNotification[]>
}

export const NotificationsContext = createContext<NotificationsCtx>()