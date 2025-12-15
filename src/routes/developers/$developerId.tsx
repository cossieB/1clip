import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PhotoCardGrid, PhotoCardGridSkeleton } from '~/components/CardLink/PhotoCardLink'
import { CompanyPage } from '~/components/CompanyPage/CompanyPage'
import { NotFound } from '~/components/NotFound'
import { getDeveloperFn } from '~/services/developerService'
import { getGamesByDeveloperFn } from '~/services/gamesService'

export const Route = createFileRoute('/developers/$developerId')({
    component: RouteComponent,
    params: {
        parse: params => ({
            developerId: Number(params.developerId)
        })
    },
    loader: async ({ context, params: { developerId } }) => {
        return await context.queryClient.ensureQueryData({
            queryKey: ["developers", developerId],
            queryFn: () => getDeveloperFn({ data: developerId })
        })
    },
    notFoundComponent: () => <NotFound message="These Aren't The Devs You're Looking For" />
})

function RouteComponent() {
    const params = Route.useParams()
    const devResult = useQuery(() => ({
        queryKey: ["developers", params().developerId],
        queryFn: () => getDeveloperFn({ data: params().developerId })
    }))

    const gamesResult = useQuery(() => ({
        queryKey: ["games", "byDev", params().developerId],
        queryFn: () => getGamesByDeveloperFn({ data: params().developerId })
    }))

    return (
        <>
            <Suspense>
                <CompanyPage
                    id={devResult.data!.developerId}
                    logo={devResult.data!.logo}
                    name={devResult.data!.name}
                    summary={devResult.data!.summary}
                />
            </Suspense>
            <PhotoCardGrid
                arr={gamesResult.data!}
                getLabel={game => game.title}
                getPic={game => game.cover}
                getParam={game => ({
                    gameId: game.gameId
                })}
                to='/games/$gameId'
            />
        </>
    )
}
