import { createFileRoute } from '@tanstack/solid-router'
import { GamesList } from '~/features/games/components/GamesList'
import { gamesQueryOpts } from '~/features/games/utils/gameQueryOpts'

export const Route = createFileRoute('/games/genres/$genre')({
    component: RouteComponent,
    loader: async ({ context, params: { genre } }) => {
        return context.queryClient.ensureQueryData(gamesQueryOpts({tag: genre}))
    }
})

function RouteComponent() {
    const params = Route.useParams()

    return (
        <GamesList
            filters={{tag: params().genre}}
        />
    )
}
