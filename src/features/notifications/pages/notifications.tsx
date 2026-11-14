import { NotificationsList } from "../components/NotificationsList";
import { createMemo } from "solid-js";
import { ensureAuthOrRedirect } from "~/features/auth/utils/ensureAuth";

export function NotificationsRoute() {
    createMemo(() => ensureAuthOrRedirect(), {
        deferStream: true
    })
    return <NotificationsList />
}