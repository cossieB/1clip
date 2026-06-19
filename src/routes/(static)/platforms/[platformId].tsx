import { Meta, Title } from "@solidjs/meta"
import { useParams } from "@solidjs/router"
import { useQuery } from "@tanstack/solid-query"
import { Suspense } from "solid-js"
import { CompanyPage } from "~/components/CompanyPage/CompanyPage"
import { GamesList } from "~/features/games/components/GamesList"
import { platformQueryOpts } from "~/features/platforms/utils/platformQueryOpts"
import { STORAGE_DOMAIN } from "~/utils/env"

export default function PlatformIdPage() {

    const params = useParams()
    const devResult = useQuery(() => platformQueryOpts(Number(params.platformId)!))

    return (
        <>
            <Suspense>
                <Title> {devResult.data!.name} </Title>
                <Meta name="og:image" content={STORAGE_DOMAIN + devResult.data?.logo} />                                
                <CompanyPage
                    id={devResult.data!.platformId}
                    logo={STORAGE_DOMAIN + devResult.data!.logo}
                    name={devResult.data!.name}
                    summary={devResult.data!.summary}
                    type='platform'
                />
            </Suspense>
            <GamesList
                filters={{ platformId: Number(params.platformId) }}
            />
        </>
    )
}