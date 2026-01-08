import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, Link, notFound } from '@tanstack/solid-router'
import { Show, Suspense } from 'solid-js'
import { CompanyPage } from '~/components/CompanyPage/CompanyPage'
import { GamesList } from '~/features/games/components/GamesList'
import { NotFound } from '~/components/NotFound/NotFound'
import { getGamesByDeveloperFn } from '~/serverFn/games'
import { STORAGE_DOMAIN } from '~/utils/env'
import { developerQueryOpts } from '~/features/developers/utils/developerQueryOpts'
import { AdminWrapper } from '~/components/AdminWrapper'

export const Route = createFileRoute('/developers/$developerId/')({
    component: RouteComponent,

    loader: async ({ context, params }) => {
        if (Number.isNaN(params.developerId)) throw notFound();
        context.queryClient.ensureQueryData({
            queryKey: ["games", "byDev", params.developerId],
            queryFn: () => getGamesByDeveloperFn({ data: params.developerId })
        })
        return await context.queryClient.ensureQueryData(developerQueryOpts(params.developerId))
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.name + " :: GG" }] : undefined,
    }),
    notFoundComponent: () => <NotFound message="These Aren't The Devs You're Looking For" />
})

function RouteComponent() {
    const params = Route.useParams()
    const devResult = useQuery(() => developerQueryOpts(params().developerId))

    return (
        <>
            <AdminWrapper>
                <Link from='/developers/$developerId/' to='./edit'>Edit</Link>
            </AdminWrapper>
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
                opts={{
                    queryKey: ["games", "byDev", params().developerId],
                    queryFn: () => getGamesByDeveloperFn({ data: params().developerId })
                }}
            />
        </>
    )
}
