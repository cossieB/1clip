import { createFileRoute, Outlet } from '@tanstack/solid-router'
import { checkSessionFn } from '~/services/authService'

export const Route = createFileRoute('/auth')({
    component: RouteComponent,
    loader: ({location, context}) => checkSessionFn()
})

function RouteComponent() {
    return <Outlet />
}
