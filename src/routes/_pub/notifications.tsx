import { ClientOnly, createFileRoute, redirect } from '@tanstack/solid-router'
import { NotificationsList } from '~/components/Notifications/NotificationsList'
import { NotificationsProvider } from '~/components/Notifications/NotificationsProvider'

export const Route = createFileRoute('/_pub/notifications')({
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
        if (!context.user) throw redirect({ to: "/" })
    }
})

function RouteComponent() {
    return (
        <ClientOnly>
            <h1 style={{"text-align": "center", padding: "1rem 0"}}>Notifications</h1>
            <NotificationsProvider>
                <NotificationsList />
            </NotificationsProvider>
        </ClientOnly>
    )
}
