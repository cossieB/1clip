import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PostList } from '~/features/posts/components/PostList'
import { usePostCache } from '~/features/posts/hooks/usePostCache'
import { getPostsByTagFn } from '~/serverFn/posts'

export const Route = createFileRoute('/posts/tags/$tag')({
    component: RouteComponent,
    loader: async ({ context, params: { tag } }) => {
        await context.queryClient.ensureQueryData({
            queryKey: ["posts", "byTag", tag],
            queryFn: () => getPostsByTagFn({ data: tag })
        })
    }
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => ({
        queryKey: ["posts", "byTag", params().tag],
        queryFn: () => getPostsByTagFn({ data: params().tag })
    }))

    usePostCache(result)

    return (
        <Suspense>
            <PostList posts={result.data!} />
        </Suspense>
    )
}
