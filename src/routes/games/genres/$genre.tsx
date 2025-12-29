import { createFileRoute } from '@tanstack/solid-router'
import { GamesList } from '~/components/GamesList'
import { getGamesByGenreFn } from '~/serverFn/games'

export const Route = createFileRoute('/games/genres/$genre')({
    component: RouteComponent,
    loader: async ({ context, params: { genre } }) => {
        return context.queryClient.ensureQueryData({
            queryKey: ["games", "genres", genre],
            queryFn: () => getGamesByGenreFn({ data: genre })
        })
    }
})

function RouteComponent() {
    const params = Route.useParams()

    return (
        <GamesList
            query={() => ({
                queryKey: ["games", "tag", params().genre],
                queryFn: () => getGamesByGenreFn({ data: params().genre })
            })}
        />
    )
}
