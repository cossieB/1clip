import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, notFound } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PostId } from '~/features/posts/components/PostId'
import { postQueryOpts, postsQueryOpts } from '~/features/posts/utils/postQueryOpts'

export const Route = createFileRoute('/_pub/posts/$postId')({
    params: {
        parse: params => ({
            postId: Number(params.postId)
        })
    },
    loader: async ({ context, params: { postId }, }) => {        
        if (Number.isNaN(postId)) throw notFound()
        return await context.queryClient.ensureQueryData(postQueryOpts(postId))
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.title + " :: 1Clip" }] : undefined,
    }),
    component: RouteComponent,
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => postQueryOpts(params().postId))


    return (
        <Suspense>
            <PostId post={result.data!} />
        </Suspense>
    )
}
postsQueryOpts