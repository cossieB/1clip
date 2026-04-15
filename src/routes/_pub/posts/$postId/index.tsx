import { createFileRoute } from '@tanstack/solid-router'
import { CommentList } from '~/features/comments/components/CommentList'

export const Route = createFileRoute('/_pub/posts/$postId/')({
    component: RouteComponent,
})

function RouteComponent() {
    const params = Route.useParams()
    return <CommentList originalPost={params().postId}  />
}
