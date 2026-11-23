import { createMemo, Loading, refresh, Show } from "solid-js";
import { getActorFn, getActorsWithCharactersFn } from "../actorsApi";
import { query, useParams } from "@solidjs/router";
import { paths } from "~/router";
import NotFound from "~/routes/[...404]";
import { Spinner } from "~/components/Loader/Spinner";
import { ActorForm } from "../components/ActorForm";
import { GET } from "@solidjs/web/server-functions";
import { respond } from "@solidjs/web";

// wrapper to override Cache-Control header
const q = GET(async (id: number) => {
    'use server'
    const actor = await getActorsWithCharactersFn(id)
    return respond(actor, {
        headers: {
            "Cache-Control": "no-cache",
            ...(actor && {
                "Last-Modified": (actor.dateModified ?? actor.dateAdded).toUTCString()
            })
        }
    })
})

export function AdminActorRoute() {
    const params = useParams(paths.admin.actors)
    const actor = createMemo(() => q(parseInt(params.actorId)))

    return (
        <Loading fallback={<Spinner />}>
            <Show when={actor()} fallback={<NotFound />}>
                {actor => <ActorForm actor={actor()} />}
            </Show>
        </Loading>
    )
}