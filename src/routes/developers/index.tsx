import { useQuery, useQueryClient } from '@tanstack/solid-query'
import { createFileRoute } from '@tanstack/solid-router'
import { createEffect, For, Suspense } from 'solid-js'
import { LogoLink } from '~/components/LogoLink/LogoLink'
import { getDevelopersFn } from '~/serverFn/developers'
import styles from "~/lists.module.css"

export const Route = createFileRoute('/developers/')({
    component: RouteComponent,
    loader: async ({ context }) => {
        return context.queryClient.ensureQueryData({
            queryKey: ["developers"],
            queryFn: () => getDevelopersFn()
        })
    },
    head: () => ({
        meta: [{ title: "Developers :: GG" }],
    }),
})

function RouteComponent() {
    const queryClient = useQueryClient()
    const result = useQuery(() => ({
        queryKey: ["developers"],
        queryFn: () => getDevelopersFn()
    }))

    createEffect(() => {
        if (result.data) {
            for (const item of result.data) {
                queryClient.setQueryData(["developers", item.developerId], item)
            }
        }
    })

    return (
        <div class={styles.grid300}>

            <Suspense>
                <For each={result.data}>
                    {dev =>
                        <LogoLink
                            href='developer'
                            item={{
                                id: dev.developerId,
                                logo: dev.logo,
                                name: dev.name
                            }}
                        />
                    }
                </For>
            </Suspense>
        </div>
    )
}
