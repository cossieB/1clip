import { createFileRoute, redirect } from '@tanstack/solid-router'
import { gamesQueryOpts } from '~/features/games/utils/gameQueryOpts';
import { CreatePostPage } from '~/features/posts/components/CreatePostPage';

export const Route = createFileRoute('/_pub/_posts/create')({
    component: RouteComponent,
    beforeLoad: async ({context: {user}}) => {
        if (!user) throw redirect({ to: "/auth/signin", replace: true, search: { redirect: "/create" }, })
    },

    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(gamesQueryOpts())
    },
    head: () => ({
        meta: [{ title: "Create Post :: 1Clip" }],
    }),
})

function RouteComponent() {
    return <CreatePostPage />
}
