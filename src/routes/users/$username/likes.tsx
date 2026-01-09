import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PostList } from '~/features/posts/components/PostList'
import { postsQueryOpts } from '~/features/posts/utils/postQueryOpts'
import { getPostsFn } from '~/serverFn/posts'

export const Route = createFileRoute('/users/$username/likes')({
    component: RouteComponent,
    loader: async ({context, params: {username}}) => {
        context.queryClient.ensureQueryData(postsQueryOpts({likerUsername: username}))
    }
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => (postsQueryOpts({likerUsername: params().username})))
    return (
        <Suspense>
            <PostList posts={result.data!} />
        </Suspense>
    )
}
