import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PostList } from '~/features/posts/components/PostList'
import { getPostsFn } from '~/serverFn/posts'

export const Route = createFileRoute('/users/$username/likes')({
    component: RouteComponent,
    loader: async ({context, params: {username}}) => {
        context.queryClient.ensureQueryData({
            queryKey: ["posts", {likerUsername: username}],
            queryFn: () => getPostsFn({data: {likerUsername: username}})
        })
    }
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => ({
        queryKey: ["posts", {likerUsername: params().username}],
        queryFn: () => getPostsFn({data: {likerUsername: params().username}})
    }))
    return (
        <Suspense>
            <PostList posts={result.data!} />
        </Suspense>
    )
}
