import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, redirect } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { CommentBlock } from '~/features/comments/components/CommentBlock'
import { getCommentByIdFn } from '~/serverFn/comments'

export const Route = createFileRoute('/_pub/posts/$postId/$commentId')({
    component: RouteComponent,
    params: {
        parse: params => ({
            commentId: Number(params.commentId)
        })
    },
    loader: async ({ context, params }) => {
        if (Number.isNaN(params.commentId)) throw redirect({ to: "/posts/$postId", params: { postId: params.postId } })
        await context.queryClient.ensureQueryData({
            queryKey: ["comments", params.commentId],
            queryFn: () => getCommentByIdFn({ data: params })
        })
    }
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => ({
        queryKey: ["comments", params().commentId],
        queryFn: () => getCommentByIdFn({ data: params() })
    }))
    return (
        <Suspense>
            <CommentBlock comment={result.data!} originalPost={params().postId} />
        </Suspense>
    )
}
