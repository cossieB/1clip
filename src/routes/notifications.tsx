import { clientOnly } from "@solidjs/start";

const NotificationsList = clientOnly(() => import("~/features/notifications/components/NotificationsList"))

export default function NotificationsRoute() {
    return (
        <>
            <h1 style={{ "text-align": "center", padding: "1rem 0" }}>Notifications</h1>
            <NotificationsList />
        </>
    )
}
