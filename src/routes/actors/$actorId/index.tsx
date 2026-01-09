import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, Link, notFound } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { AdminWrapper } from '~/components/AdminWrapper'
import { CompanyPage } from '~/components/CompanyPage/CompanyPage'
import { actorQueryOpts } from '~/features/actors/utils/actorQueryOpts'
import { GamesList } from '~/features/games/components/GamesList'
import { gamesQueryOpts } from '~/features/games/utils/gameQueryOpts'
import { STORAGE_DOMAIN } from '~/utils/env'

export const Route = createFileRoute('/actors/$actorId/')({
    component: RouteComponent,

    loader: async ({ context, params }) => {
        if (Number.isNaN(params.actorId)) throw notFound()
        context.queryClient.ensureQueryData(gamesQueryOpts({actorId: params.actorId}))
        return await context.queryClient.ensureQueryData(actorQueryOpts(params.actorId))
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.name + " :: GG" }] : undefined,
    }),
})

function RouteComponent() {
    const params = Route.useParams()
    const devResult = useQuery(() => actorQueryOpts(params().actorId))

    return (
        <>
            <AdminWrapper>
                <Link from='/actors/$actorId' to='./edit'>Edit</Link>
            </AdminWrapper>
            <Suspense>
                <CompanyPage
                    id={devResult.data!.actorId}
                    logo={STORAGE_DOMAIN + devResult.data!.photo}
                    name={devResult.data!.name}
                    summary={devResult.data!.bio}
                    type='actor'
                    showName
                />
            </Suspense>
            <GamesList
                filters={{actorId: params().actorId}}
            />
        </>
    )
}
