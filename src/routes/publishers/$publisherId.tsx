import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, notFound } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { CompanyPage } from '~/components/CompanyPage/CompanyPage'
import { GamesList } from '~/components/GamesList'
import { NotFound } from '~/components/NotFound'
import { getGamesByPublisherFn } from '~/serverFn/games'
import { getPublisherFn } from '~/serverFn/publishers'

export const Route = createFileRoute('/publishers/$publisherId')({
    component: RouteComponent,
    params: {
        parse: params => ({
            publisherId: Number(params.publisherId)
        })
    },
    loader: async ({ context, params: { publisherId } }) => {
        if (Number.isNaN(publisherId)) throw notFound()
        return await context.queryClient.ensureQueryData({
            queryKey: ["publishers", publisherId],
            queryFn: () => getPublisherFn({ data: publisherId })
        })
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.name + " :: GG" }] : undefined,
    }),
    notFoundComponent: () => <NotFound message="These Aren't The Pubs You're Looking For" />
})

function RouteComponent() {
    const params = Route.useParams()
    const devResult = useQuery(() => ({
        queryKey: ["publishers", params().publisherId],
        queryFn: () => getPublisherFn({ data: params().publisherId })
    }))

    return (
        <>
            <Suspense>
                <CompanyPage
                    id={devResult.data!.publisherId}
                    logo={devResult.data!.logo}
                    name={devResult.data!.name}
                    summary={devResult.data!.summary}
                    type='publisher'
                />
            </Suspense>
            <GamesList
                query={() => ({
                    queryKey: ["games", "byPub", params().publisherId],
                    queryFn: () => getGamesByPublisherFn({ data: params().publisherId })
                })}
            />
        </>
    )
}
