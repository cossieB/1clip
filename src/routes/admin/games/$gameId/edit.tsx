import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { GameForm } from '~/features/games/components/GameForm'
import { gameQueryOpts } from '~/features/games/utils/gameQueryOpts'

export const Route = createFileRoute('/admin/games/$gameId/edit')({
    component: RouteComponent,
    loader: async ({ context, params }) => {
        await context.queryClient.ensureQueryData(gameQueryOpts(params.gameId))
    }
})

function RouteComponent() {
    const params = Route.useParams()
    const result = useQuery(() => gameQueryOpts(params().gameId))
    return (
        <Suspense>
            <GameForm game={result.data!} />
        </Suspense>
    )
}
