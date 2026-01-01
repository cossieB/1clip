import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PostList } from '~/components/Posts/PostList'
import { usePostCache } from '~/hooks/usePostCache'
import { getPostsByTag } from '~/serverFn/posts'

export const Route = createFileRoute('/posts/tags/$tag')({
    component: RouteComponent,
    loader: async ({ context, params: { tag } }) => context.queryClient.ensureQueryData({
        queryKey: ["posts", "byTag", tag],
        queryFn: () => getPostsByTag({ data: tag })
    })
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => ({
        queryKey: ["posts", "byTag", params().tag],
        queryFn: () => getPostsByTag({ data: params().tag })
    }))

    usePostCache(result)

    return (
        <Suspense>
            <PostList posts={result.data!} />
        </Suspense>
    )
}
