import { useQuery, useQueryClient } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { createEffect, For, Suspense } from 'solid-js'
import { LogoLink } from '~/components/LogoLink/LogoLink'
import { developerQueryOpts, developersQueryOpts } from '~/features/developers/utils/developerQueryOpts'
import { STORAGE_DOMAIN } from '~/utils/env'

export const Route = createFileRoute('/developers/')({
    component: RouteComponent,
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(developersQueryOpts())
    },
    head: () => ({
        meta: [{ title: "Developers :: GG" }],
    }),
})

function RouteComponent() {
    const queryClient = useQueryClient()
    const result = useQuery(() => developersQueryOpts())

    createEffect(() => {
        if (result.data) {
            for (const item of result.data) {
                queryClient.setQueryData(developerQueryOpts(item.developerId).queryKey, item)
            }
        }
    })

    return (
        <div class={"grid300"}>

            <Suspense>
                <For each={result.data}>
                    {dev =>
                        <LogoLink
                            href='developer'
                            item={{
                                id: dev.developerId,
                                logo: STORAGE_DOMAIN + dev.logo,
                                name: dev.name
                            }}
                        />
                    }
                </For>
            </Suspense>
        </div>
    )
}
