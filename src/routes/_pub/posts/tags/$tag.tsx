import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PostList } from '~/features/posts/components/PostList'
import { usePostCache } from '~/features/posts/hooks/usePostCache'
import { postsQueryOpts } from '~/features/posts/utils/postQueryOpts'
import { getPostsFn } from '~/serverFn/posts'

export const Route = createFileRoute('/_pub/posts/tags/$tag')({
    component: RouteComponent,
    loader: async ({ context, params: { tag } }) => {
        await context.queryClient.ensureQueryData(postsQueryOpts({tag}))
    }
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => (postsQueryOpts({tag: params().tag})))

    usePostCache(result)

    return (
        <Suspense>
            <PostList posts={result.data!} />
        </Suspense>
    )
}
