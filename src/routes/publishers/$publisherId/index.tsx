import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, Link, notFound } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { CompanyPage } from '~/components/CompanyPage/CompanyPage'
import { GamesList } from '~/features/games/components/GamesList'
import { NotFound } from '~/components/NotFound/NotFound'
import { STORAGE_DOMAIN } from '~/utils/env'
import { publisherQueryOpts } from '~/features/publishers/utils/publisherQueryOpts'
import { AdminWrapper } from '~/components/AdminWrapper'
import { gamesQueryOpts } from '~/features/games/utils/gameQueryOpts'

export const Route = createFileRoute('/publishers/$publisherId/')({
    component: RouteComponent,
    loader: async ({ context, params}) => {
        if (Number.isNaN(params.publisherId)) throw notFound()
        context.queryClient.ensureQueryData(gamesQueryOpts({publisherId: params.publisherId}))
        return await context.queryClient.ensureQueryData(publisherQueryOpts(params.publisherId))
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.name + " :: GG" }] : undefined,
    }),
    notFoundComponent: () => <NotFound message="These Aren't The Pubs You're Looking For" />
})

function RouteComponent() {
    const params = Route.useParams()
    const devResult = useQuery(() => (publisherQueryOpts(params().publisherId)))

    return (
        <>
            <AdminWrapper>
                <Link from='/publishers/$publisherId/' to='./edit'>Edit</Link>
            </AdminWrapper>
            <Suspense>
                <CompanyPage
                    id={devResult.data!.publisherId}
                    logo={STORAGE_DOMAIN + devResult.data!.logo}
                    name={devResult.data!.name}
                    summary={devResult.data!.summary}
                    type='publisher'
                />
            </Suspense>
            <GamesList
                filters={{publisherId: params().publisherId}}
            />
        </>
    )
}
