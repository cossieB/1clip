import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, notFound } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { CompanyPage } from '~/components/CompanyPage/CompanyPage'
import { actorQueryOpts } from '~/features/actors/utils/actorQueryOpts'
import { GamesList } from '~/features/games/components/GamesList'
import { gamesWithExtrasQueryOpts } from '~/features/games/utils/gameQueryOpts'
import { STORAGE_DOMAIN } from '~/utils/env'

export const Route = createFileRoute('/_pub/actors/$actorId/')({
    component: RouteComponent,

    loader: async ({ context, params }) => {
        if (Number.isNaN(params.actorId)) throw notFound()
        context.queryClient.ensureInfiniteQueryData(gamesWithExtrasQueryOpts({ actorId: params.actorId }))
        return await context.queryClient.ensureQueryData(actorQueryOpts(params.actorId))
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.name + " :: 1Clip" }] : undefined,
    }),
})

function RouteComponent() {
    const params = Route.useParams()
    const devResult = useQuery(() => actorQueryOpts(params().actorId))

    return (
        <>
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
                filters={{ actorId: params().actorId }}
            />
        </>
    )
}
