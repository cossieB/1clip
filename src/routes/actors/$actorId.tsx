import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, notFound } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { CompanyPage } from '~/components/CompanyPage/CompanyPage'
import { GamesList } from '~/components/GamesList'
import { getActorFn } from '~/serverFn/actors'
import { getGamesByActorFn } from '~/serverFn/games'


export const Route = createFileRoute('/actors/$actorId')({
    component: RouteComponent,
    params: {
        parse: params => ({
            actorId: Number(params.actorId)
        })
    },
    loader: async ({ context, params: { actorId } }) => {
        if (Number.isNaN(actorId)) throw notFound()
        return await context.queryClient.ensureQueryData({
            queryKey: ["actors", actorId],
            queryFn: () => getActorFn({ data: actorId })
        })
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.name + " :: GG" }] : undefined,
    }),
})

function RouteComponent() {
    const params = Route.useParams()
    const devResult = useQuery(() => ({
        queryKey: ["actors", params().actorId],
        queryFn: () => getActorFn({ data: params().actorId })
    }))

    return (
        <>
            <Suspense>
                <CompanyPage
                    id={devResult.data!.actorId}
                    logo={devResult.data!.photo}
                    name={devResult.data!.name}
                    summary={devResult.data!.bio}
                    type='actor'
                    showName
                />
            </Suspense>
            <GamesList
                query={() => ({
                    queryKey: ["games", "withActor", params().actorId],
                    queryFn: () => getGamesByActorFn({ data: params().actorId })
                })}
            />
        </>
    )
}
