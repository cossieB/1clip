import { createFileRoute } from '@tanstack/solid-router'
import { Show, Suspense } from 'solid-js'
import { getSessionFn } from '~/services/authService'

export const Route = createFileRoute('/settings/profile')({
    component: RouteComponent,
    loader: async () => getSessionFn()
})

function RouteComponent() {
    const user = Route.useLoaderData()

    return (
        <Suspense>
            {user().username}
        </Suspense>
    )
}
