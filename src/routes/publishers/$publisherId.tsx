import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { PhotoCardGrid, PhotoCardGridSkeleton } from '~/components/CardLink/PhotoCardLink'
import { CompanyPage } from '~/components/CompanyPage/CompanyPage'
import { NotFound } from '~/components/NotFound'
import { getGamesByPublisherFn } from '~/services/gamesService'
import { getPublisherFn } from '~/services/publisherService'

export const Route = createFileRoute('/publishers/$publisherId')({
    component: RouteComponent,
    params: {
        parse: params => ({
            publisherId: Number(params.publisherId)
        })
    },
    loader: async ({ context, params: { publisherId } }) => {
        return await context.queryClient.ensureQueryData({
            queryKey: ["publisher", publisherId],
            queryFn: () => getPublisherFn({ data: publisherId })
        })
    },
    notFoundComponent: () => <NotFound message="These Aren't The Pubs You're Looking For" />
})

function RouteComponent() {
    const params = Route.useParams()
    const devResult = useQuery(() => ({
        queryKey: ["publishers", params().publisherId],
        queryFn: () => getPublisherFn({ data: params().publisherId })
    }))

    const gamesResult = useQuery(() => ({
        queryKey: ["games", "byPub", params().publisherId],
        queryFn: () => getGamesByPublisherFn({ data: params().publisherId })
    }))

    return (
        <>
            <Suspense>
                <CompanyPage
                    id={devResult.data!.publisherId}
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
