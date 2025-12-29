import { useQuery } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { CompanyPage } from '~/components/CompanyPage/CompanyPage'
import { GamesList } from '~/components/GamesList'
import { NotFound } from '~/components/NotFound'
import { getGamesByPlatformFn } from '~/serverFn/games'
import { getPlatformFn } from '~/serverFn/platforms'

export const Route = createFileRoute('/platforms/$platformId')({
    component: RouteComponent,
    params: {
        parse: params => ({
            platformId: Number(params.platformId)
        })
    },
    loader: async ({ context, params: { platformId } }) => {
        return await context.queryClient.ensureQueryData({
            queryKey: ["platforms", platformId],
            queryFn: () => getPlatformFn({ data: platformId })
        })
    },
    head: ({ loaderData }) => ({
        meta: loaderData ? [{ title: loaderData.name + " :: GG" }] : undefined,
    }),
    notFoundComponent: () => <NotFound message="These Aren't The Platforms You're Looking For" />
})

function RouteComponent() {
    const params = Route.useParams()
    const platformResult = useQuery(() => ({
        queryKey: ["platforms", params().platformId],
        queryFn: () => getPlatformFn({ data: params().platformId })
    }))

    return (
        <>
            <Suspense>
                <CompanyPage
                    id={platformResult.data!.platformId}
                    logo={platformResult.data!.logo}
                    name={platformResult.data!.name}
                    summary={platformResult.data!.summary}
                />
            </Suspense>
            <GamesList
                query={() => ({
                    queryKey: ["games", "byPlatform", params().platformId],
                    queryFn: () => getGamesByPlatformFn({ data: params().platformId })
                })}
            />
        </>
    )
}
