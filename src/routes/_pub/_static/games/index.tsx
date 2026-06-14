import { createFileRoute } from '@tanstack/solid-router'
import { GamesList } from '~/features/games/components/GamesList'
import { gamesWithExtrasQueryOpts } from '~/features/games/utils/gameQueryOpts'

export const Route = createFileRoute('/_pub/_static/games/')({
    component: RouteComponent,
    loader: async ({ context }) => {
        await context.queryClient.ensureInfiniteQueryData(gamesWithExtrasQueryOpts())
    },
    head: () => ({
        meta: [{ title: "Games :: 1Clip" }],
    }),
})

function RouteComponent() {

    return (
        <GamesList />
    )
}
