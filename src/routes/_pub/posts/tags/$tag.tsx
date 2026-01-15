import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PostList } from '~/features/posts/components/PostList'
import { postsQueryOpts } from '~/features/posts/utils/postQueryOpts'

export const Route = createFileRoute('/_pub/posts/tags/$tag')({
    component: RouteComponent,
    loader: async ({ context, params: { tag } }) => {
        await context.queryClient.ensureInfiniteQueryData(postsQueryOpts({tag}))
    }
})

function RouteComponent() {
    const params = Route.useParams()

    return (
        <Suspense>
            <PostList filters={{tag: params().tag}} />
        </Suspense>
    )
}
