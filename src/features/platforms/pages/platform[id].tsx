import { useParams } from "@solidjs/router"
import { createMemo, Loading, Show } from "solid-js"
import { paths } from "~/router"
import { getPlatformFn } from "../platformsApi"
import { httpHeader } from "@solidjs/web"
import NotFound from "~/routes/[...404]"
import { mediaSrc } from "~/utils/mediaSrc"
import { Meta } from "@solidjs/meta"
import { SiteTitle } from "~/components/CustomSiteTitle"
import { PlatformPage } from "../components/PlatformPage"

export function PlatformIdRoute() {
    const params = useParams(paths.platforms)
    const platform = createMemo(() => {
        const platformId = Number(params.platformId)
        if (!platformId) return null
        return getPlatformFn(platformId)
    }, { deferStream: true })

    return (
        <Loading>
            <Show when={platform()} fallback={<NotFound />}>
                {platform => (
                    <>
                        {httpHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=604800")}
                        {httpHeader("Last-Modified", (platform().dateModified ?? platform().dateAdded).toUTCString())}
                        <Meta property="og:title" content={platform().name} />
                        <Meta property="og:image" content={mediaSrc(platform().logo)} />
                        <Meta property="og:url" content={`https://1clip.cossie.dev/games/${platform().platformId}`} />
                        <Meta property="og:description" content={`1Clip info page for ${platform().name}`} />
                        <Meta property="og:image:alt" content={`${platform().name} logo`} />
                        <SiteTitle> {platform().name} </SiteTitle>
                        <PlatformPage company={platform()} />
                    </>
                )}
            </Show>
        </Loading>
    )
}