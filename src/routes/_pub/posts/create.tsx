import { ClientOnly, createFileRoute, redirect } from '@tanstack/solid-router'
import { gamesQueryOpts } from '~/features/games/utils/gameQueryOpts';
import { CreatePostPage } from '~/features/posts/components/CreatePostPage';

export const Route = createFileRoute('/_pub/posts/create')({
    component: RouteComponent,
    beforeLoad: async ({context: {user}}) => {
        if (!user) throw redirect({ to: "/auth/signin", replace: true, search: { redirect: "/create" }, })
    },

    head: () => ({
        meta: [{ title: "Create Post :: 1Clip" }],
    }),
})

function RouteComponent() {
    return (
        // workaround to stop Error reading appStream: Error: SSR stream tail exceeded maximum buffer
        <ClientOnly>
            <CreatePostPage />
        </ClientOnly>
    )
}
