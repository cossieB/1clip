import { Meta } from "@solidjs/meta"
import { useParams } from "@solidjs/router"
import { useQuery } from "@tanstack/solid-query"
import { Show, Suspense } from "solid-js"
import { CompanyPage } from "~/components/CompanyPage/CompanyPage"
import { MySiteTitle } from "~/components/MySiteTitle"
import { GamesList } from "~/features/games/components/GamesList"
import { platformQueryOpts } from "~/features/platforms/utils/platformQueryOpts"
import { STORAGE_DOMAIN } from "~/utils/env"

export default function PlatformIdPage() {

    const params = useParams()
    const result = useQuery(() => platformQueryOpts(Number(params.platformId)!))

    return (
        <>
            <Show when={result.data}>
                <MySiteTitle> {result.data!.name} </MySiteTitle>
                <Meta name="og:image" content={STORAGE_DOMAIN + result.data?.logo} />                                
                <CompanyPage
                    id={result.data!.platformId}
                    logo={STORAGE_DOMAIN + result.data!.logo}
                    name={result.data!.name}
                    summary={result.data!.summary}
                    type='platform'
                />
            </Show>
            <GamesList
                filters={{ platformId: Number(params.platformId) }}
            />
        </>
    )
}