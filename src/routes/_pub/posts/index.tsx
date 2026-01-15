import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PostList } from '~/features/posts/components/PostList'
import { postsQueryOpts } from '~/features/posts/utils/postQueryOpts'

export const Route = createFileRoute('/_pub/posts/')({
    component: RouteComponent,
    loader: async ({ context }) => {
        await context.queryClient.ensureInfiniteQueryData(postsQueryOpts())
    },
    head: () => ({
        meta: [{ title: "Posts :: 1Clip" }],
    }),
})

function RouteComponent() {

    return (
        <Suspense>
            <PostList />
        </Suspense>
    )
}