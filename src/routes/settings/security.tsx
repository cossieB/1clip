import { createFileRoute } from '@tanstack/solid-router'
import { SecurityPage } from '~/components/ProfilePage/SecurityPage'

export const Route = createFileRoute('/settings/security')({
    component: RouteComponent,
})

function RouteComponent() {

    return <SecurityPage />
}
