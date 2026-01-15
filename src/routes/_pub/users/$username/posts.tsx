import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PostList } from '~/features/posts/components/PostList'
import { postsQueryOpts } from '~/features/posts/utils/postQueryOpts'

export const Route = createFileRoute('/_pub/users/$username/posts')({
    component: RouteComponent,
    loader: async ({params, context: {queryClient} }) => {
        await queryClient.ensureInfiniteQueryData(postsQueryOpts({ username: params.username }))
    }
})

function RouteComponent() {
    const params = Route.useParams()

    return (
        <Suspense>
            <PostList filters={{ username: params().username }} />
        </Suspense>
    )
}

