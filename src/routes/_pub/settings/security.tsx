import { createFileRoute } from '@tanstack/solid-router'
import { SecurityPage } from '~/features/users/components/SecurityPage'
export const Route = createFileRoute('/_pub/settings/security')({
    component: RouteComponent,
})

function RouteComponent() {

    return <SecurityPage />
}
