import { createFileRoute, notFound, redirect } from '@tanstack/solid-router'
import { Suspense } from 'solid-js/web'
import { PostList } from '~/features/posts/components/PostList'
import { postsQueryOpts } from '~/features/posts/utils/postQueryOpts'

export const Route = createFileRoute('/_pub/posts/games/$gameId')({
    component: RouteComponent,
    params: {
        parse: params => ({
            gameId: Number(params.gameId)
        })
    },
    loader: async ({ context, params: { gameId } }) => {
        if (Number.isNaN(gameId)) throw notFound()
        await context.queryClient.ensureInfiniteQueryData(postsQueryOpts({gameId}))
    }
})

function RouteComponent() {
    const params = Route.useParams()

    return (
        <Suspense>
            <PostList filters={{gameId: params().gameId}} />
        </Suspense>
    )
}
