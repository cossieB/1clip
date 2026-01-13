import { createFileRoute } from '@tanstack/solid-router'
import { GamesList } from '~/features/games/components/GamesList'
import { gamesQueryOpts } from '~/features/games/utils/gameQueryOpts'
import { getGamesFn } from '~/serverFn/games'

export const Route = createFileRoute('/_pub/games/')({
    component: RouteComponent,
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(gamesQueryOpts())
    },
    head: () => ({
        meta: [{ title: "Games :: 1Clip" }],
    }),
})

function RouteComponent() {

    return (
        <GamesList
            filters={{}}
        />
    )
}
