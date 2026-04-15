import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, notFound, Outlet } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import z from 'zod'
import { commentListQueryOpts } from '~/features/comments/utils/commentListQueryOpts'
import { PostId } from '~/features/posts/components/PostId'
import { postQueryOpts, postsQueryOpts } from '~/features/posts/utils/postQueryOpts'
import styles from "~/features/posts/components/PostId.module.css"

export const Route = createFileRoute('/_pub/posts/$postId')({
    params: {
        parse: params => ({
            postId: Number(params.postId)
        })
    },
    validateSearch: z.object({
        comment: z.number().optional().catch(undefined)
    }).optional(),
    loader: async ({ context, params: { postId }, }) => {
        if (Number.isNaN(postId)) throw notFound()
        await context.queryClient.ensureQueryData(commentListQueryOpts({ postId }))
        return await context.queryClient.ensureQueryData(postQueryOpts(postId))
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.title + " :: 1Clip" }] : undefined,
    }),
    headers: () => ({
        "Cache-Control": "max-age=3600, private"
    }),
    component: RouteComponent,
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => postQueryOpts(params().postId))


    return (
        <div class={styles.container}>
            <Suspense>
                <PostId post={result.data!} />
                <Outlet />
            </Suspense>
        </div>
    )
}
