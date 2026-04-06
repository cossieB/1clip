import { Accessor, createContext, Setter, Signal } from "solid-js";
import { NotifMessage } from "~/integrations/notificationService/notificationService.interface";

type NotificationsCtx = {
    notifications: Accessor<NotifMessage[]>
    setNotifications: Setter<NotifMessage[]>
}

export const NotificationsContext = createContext<NotificationsCtx>()