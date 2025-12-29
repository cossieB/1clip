import { useQuery, useQueryClient } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { createEffect, Show, Suspense } from 'solid-js'
import { Profile } from '~/components/ProfilePage/ProfilePage'
import { getLoggedInUser } from '~/serverFn/users'

export const Route = createFileRoute('/settings/profile')({
    component: RouteComponent,
    loader: async ({context}) => {
        return context.queryClient.ensureQueryData({
            queryKey: ["you"],
            queryFn: () => getLoggedInUser()
        })
    }
})

function RouteComponent() {
    const queryClient = useQueryClient()
    const user = useQuery(() => ({
            queryKey: ["you"],
            queryFn: () => getLoggedInUser()        
    }))

    createEffect(() => {
        if (user.data)
        queryClient.setQueryData(["users", user.data.userId], user.data)
    })

    return (
        <Suspense>
            <Profile user={user.data!} />
        </Suspense>
    )
}