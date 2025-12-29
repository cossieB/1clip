import { useQuery, useQueryClient } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { Suspense, For, createEffect } from 'solid-js'
import { LogoLink } from '~/components/LogoLink/LogoLink'
import { getPlatformsFn } from '~/serverFn/platforms'
import styles from "~/lists.module.css"

export const Route = createFileRoute('/platforms/')({
    component: RouteComponent,
    loader: async ({ context }) => {
        return context.queryClient.ensureQueryData({
            queryKey: ["platforms"],
            queryFn: () => getPlatformsFn()
        })
    },
    head: () => ({
        meta: [{ title: "Platforms :: GG" }],
    }),
})

function RouteComponent() {
    const queryClient = useQueryClient()
    const result = useQuery(() => ({
        queryKey: ["platforms"],
        queryFn: () => getPlatformsFn()
    }))

    createEffect(() => {
        if (result.data) {
            for (const item of result.data) {
                queryClient.setQueryData(["platforms", item.platformId], item)
            }
        }
    })

    return (
        <div class={styles.grid300}>
            <Suspense>
                <For each={result.data}>
                    {platform =>
                        <LogoLink
                            href='platform'
                            item={{
                                id: platform.platformId,
                                logo: platform.logo,
                                name: platform.name
                            }}
                        />
                    }
                </For>
            </Suspense>
        </div>
    )
}
