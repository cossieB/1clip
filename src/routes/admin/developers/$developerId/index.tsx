import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, Link, notFound } from '@tanstack/solid-router'
import { Show, Suspense } from 'solid-js'
import { CompanyPage } from '~/components/CompanyPage/CompanyPage'
import { GamesList } from '~/features/games/components/GamesList'
import { NotFound } from '~/components/NotFound/NotFound'
import { STORAGE_DOMAIN } from '~/utils/env'
import { developerQueryOpts } from '~/features/developers/utils/developerQueryOpts'
import { gamesQueryOpts } from '~/features/games/utils/gameQueryOpts'

export const Route = createFileRoute('/admin/developers/$developerId/')({
    component: RouteComponent,

    loader: async ({ context, params }) => {
        if (Number.isNaN(params.developerId)) throw notFound();
        context.queryClient.ensureQueryData(gamesQueryOpts({developerId: params.developerId}))
        return await context.queryClient.ensureQueryData(developerQueryOpts(params.developerId))
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.name + " :: 1Clip" }] : undefined,
    }),
    notFoundComponent: () => <NotFound message="These Aren't The Devs You're Looking For" />
})

function RouteComponent() {
    const params = Route.useParams()
    const devResult = useQuery(() => developerQueryOpts(params().developerId))

    return (
        <>
            <Suspense>
                <CompanyPage
                    id={devResult.data!.developerId}
                    logo={STORAGE_DOMAIN + devResult.data!.logo}
                    name={devResult.data!.name}
                    summary={devResult.data!.summary}
                    type='developer'
                />
            </Suspense>
            <GamesList
                filters={{developerId: params().developerId}}
            />
        </>
    )
}
