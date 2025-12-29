import { createFileRoute, Outlet } from '@tanstack/solid-router'
import z from 'zod'
import { checkSessionFn } from '~/serverFn/auth'

export const Route = createFileRoute('/auth')({
    component: RouteComponent,
    loader: ({location, context}) => checkSessionFn()
})

function RouteComponent() {
    return <Outlet />
}
