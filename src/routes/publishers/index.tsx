import { useQuery, useQueryClient } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense, For, createEffect } from 'solid-js'
import { LogoLink } from '~/components/LogoLink/LogoLink'
import { STORAGE_DOMAIN } from '~/utils/env'
import { publisherQueryOpts, publishersQueryOpts } from '~/features/publishers/utils/publisherQueryOpts'

export const Route = createFileRoute('/publishers/')({
    component: RouteComponent,
    loader: async ({ context }) => {
        return context.queryClient.ensureQueryData(publishersQueryOpts())
    },
    head: () => ({
        meta: [{ title: "Publishers :: GG" }],
    }),
})

function RouteComponent() {
    const queryClient = useQueryClient()
    const result = useQuery(() => publishersQueryOpts())

    createEffect(() => {
        if (result.data) {
            for (const item of result.data) {
                queryClient.setQueryData(publisherQueryOpts(item.publisherId).queryKey, item)
            }
        }
    })

    return (
        <Suspense>
            <div class={"grid300"}>
                <For each={result.data}>
                    {pub =>
                        <LogoLink
                            href='publisher'
                            item={{
                                id: pub.publisherId,
                                logo: STORAGE_DOMAIN + pub.logo,
                                name: pub.name
                            }}
                        />
                    }
                </For>
            </div>
        </Suspense>
    )
}
