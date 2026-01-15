import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, notFound } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { CompanyPage } from '~/components/CompanyPage/CompanyPage'
import { GamesList } from '~/features/games/components/GamesList'
import { NotFound } from '~/components/NotFound/NotFound'
import { STORAGE_DOMAIN } from '~/utils/env'
import { platformQueryOpts } from '~/features/platforms/utils/platformQueryOpts'
import { gamesWithExtrasQueryOpts } from '~/features/games/utils/gameQueryOpts'

export const Route = createFileRoute('/_pub/platforms/$platformId/')({
    component: RouteComponent,

    loader: async ({ context, params }) => {
        if (Number.isNaN(params.platformId)) throw notFound()
        context.queryClient.ensureInfiniteQueryData(gamesWithExtrasQueryOpts({platformId: params.platformId}))
        return await context.queryClient.ensureQueryData(platformQueryOpts(params.platformId))
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.name + " :: 1Clip" }] : undefined,
    }),
    notFoundComponent: () => <NotFound message="These Aren't The Platforms You're Looking For" />
})

function RouteComponent() {
    const params = Route.useParams()
    const platformResult = useQuery(() => platformQueryOpts(params().platformId))

    return (
        <>
            <Suspense>
                <CompanyPage
                    id={platformResult.data!.platformId}
                    logo={STORAGE_DOMAIN + platformResult.data!.logo}
                    name={platformResult.data!.name}
                    summary={platformResult.data!.summary}
                    type="platform"
                />
            </Suspense>
            <GamesList
                filters={{platformId: params().platformId}}
            />
        </>
    )
}
