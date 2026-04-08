import { ClientOnly, createFileRoute, redirect } from '@tanstack/solid-router'
import { NotificationsList } from '~/features/notifications/components/NotificationsList'
import { NotificationsProvider } from '~/features/notifications/components/NotificationsProvider'

export const Route = createFileRoute('/_pub/notifications')({
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
        if (!context.user) throw redirect({ to: "/" })
    },
    head: () => ({
        meta: [{ title: "Notifications :: 1Clip" }],
    }),
})

function RouteComponent() {
    return (
        <ClientOnly>
            <h1 style={{ "text-align": "center", padding: "1rem 0" }}>Notifications</h1>
            <NotificationsList />
        </ClientOnly>
    )
}
