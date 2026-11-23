import { useParams } from "@solidjs/router"
import { createMemo, Loading, Show } from "solid-js"
import { paths } from "~/router"
import { getActorFn } from "../actorsApi"
import NotFound from "~/routes/[...404]"
import { httpHeader } from "@solidjs/web"
import { Meta } from "@solidjs/meta"
import { mediaSrc } from "~/utils/mediaSrc"
import { SiteTitle } from "~/components/CustomSiteTitle"
import { ActorPage } from "../components/ActorPage"

export function ActorIdRoute() {
    const params = useParams(paths.actors)
    const actor = createMemo(() => {
        const actorId = Number(params.actorId)
        if (!actorId) return null
        return getActorFn(actorId)
    }, { deferStream: true })

    return (
        <Loading>
            <Show when={actor()} fallback={<NotFound  />}>
                {actor => (
                    <>
                        {httpHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=604800")}
                        {httpHeader("Last-Modified", (actor().dateModified ?? actor().dateAdded).toUTCString())}
                        <Meta property="og:title" content={actor().name} />
                        <Show when={actor().photo}>
                            <Meta property="og:image" content={mediaSrc(actor().photo!)} />
                        </Show>
                        <Meta property="og:url" content={`https://1clip.cossie.dev/actors/${actor().actorId}`} />
                        <Meta property="og:description" content={`1Clip info page for ${actor().name}`} />
                        <Meta property="og:image:alt" content={`${actor().name} banner`} />
                        <SiteTitle> {actor().name} </SiteTitle>
                        <ActorPage actor={actor()} />
                    </>
                )}
            </Show>
        </Loading>
    )
}