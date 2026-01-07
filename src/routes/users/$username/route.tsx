import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, Outlet } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { NavTabs } from '~/components/NavTabs/NavTabs'
import { UserPage } from '~/features/users/components/UserPage'
import { getUserByUsernameFn } from '~/serverFn/users'

export const Route = createFileRoute('/users/$username')({
    component: RouteComponent,
    loader: async ({ params, context: { queryClient, }}) => {
        await queryClient.ensureQueryData({
            queryKey: ["users", params.username],
            queryFn: () => getUserByUsernameFn({ data: params.username })
        })
    }
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => ({
        queryKey: ["users", params().username],
        queryFn: () => getUserByUsernameFn({ data: params().username })
    }))

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
