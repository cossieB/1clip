import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PostList } from '~/features/posts/components/PostList'
import { getPostsFn } from '~/serverFn/posts'

export const Route = createFileRoute('/users/$username/posts')({
    component: RouteComponent,
    loader: async ({params, context: {queryClient} }) => {
        await queryClient.ensureQueryData({
            queryKey: ["posts", { username: params.username }],
            queryFn: () => getPostsFn({ data: { username: params.username } })
        })
    }
})

function RouteComponent() {
    const params = Route.useParams()
    const postResult = useQuery(() => ({
        queryKey: ["posts", { username: params().username }],
        queryFn: () => getPostsFn({ data: { username: params().username } })
    }))
    return (
        <Suspense>
            <PostList posts={postResult.data!} />
        </Suspense>
    )
}

