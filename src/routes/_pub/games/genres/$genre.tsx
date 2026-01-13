import { createFileRoute } from '@tanstack/solid-router'
import { GamesList } from '~/features/games/components/GamesList'
import { gamesQueryOpts } from '~/features/games/utils/gameQueryOpts'

export const Route = createFileRoute('/_pub/games/genres/$genre')({
    component: RouteComponent,
    loader: async ({ context, params: { genre } }) => {
        return context.queryClient.ensureQueryData(gamesQueryOpts({genre: genre}))
    }
})

function RouteComponent() {
    const params = Route.useParams()

    return (
        <GamesList
            filters={{genre: params().genre}}
        />
    )
}
