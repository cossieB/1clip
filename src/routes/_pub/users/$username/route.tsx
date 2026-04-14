import { useQuery, useQueryClient } from '@tanstack/solid-query'
import { createFileRoute, Outlet } from '@tanstack/solid-router'
import { createEffect, Suspense } from 'solid-js'
import { NavTabs } from '~/components/NavTabs/NavTabs'
import { UserPage } from '~/features/users/components/UserPage'
import { userQueryOpts } from '~/features/users/utils/userQueryOpts'
import { getUserByUsernameFn } from '~/serverFn/users'

export const Route = createFileRoute('/_pub/users/$username')({
    component: RouteComponent,
    loader: async ({ params, context: { queryClient } }) => {
        await queryClient.ensureQueryData({
            queryKey: ["users", params.username],
            queryFn: () => getUserByUsernameFn({ data: params.username })
        })
    }
})

function RouteComponent() {
    const params = Route.useParams()
    const queryClient = useQueryClient()
    const result = useQuery(() => ({
        queryKey: ["users", params().username],
        queryFn: () => getUserByUsernameFn({ data: params().username })
    }))

    createEffect(() => {
        if (result.data)
            queryClient.setQueryData(userQueryOpts(result.data.id).queryKey, result.data)
    })

    return (
        <>
            <Suspense>
                <UserPage user={result.data!} />
            </Suspense>
            <NavTabs
                tabs={[{
                    label: "posts",
                    to: "/users/$username/posts"
                }, {
                    label: "likes",
                    to: "/users/$username/likes"
                }]}
            />
            <Outlet />
        </>
    )
}
