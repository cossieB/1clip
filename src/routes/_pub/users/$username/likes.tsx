import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PostList } from '~/features/posts/components/PostList'
import { postsQueryOpts } from '~/features/posts/utils/postQueryOpts'

export const Route = createFileRoute('/_pub/users/$username/likes')({
    component: RouteComponent,
    loader: async ({context, params: {username}}) => {
        context.queryClient.ensureInfiniteQueryData(postsQueryOpts({likerUsername: username}))
    }
})

function RouteComponent() {
    const params = Route.useParams()

    return (
        <Suspense>
            <PostList filters={{likerUsername: params().username}} />
        </Suspense>
    )
}
