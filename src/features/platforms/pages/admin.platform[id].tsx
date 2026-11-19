import { createMemo, Loading, refresh, Show } from "solid-js";
import { getPlatformFn } from "../platformsApi";
import { query, useParams } from "@solidjs/router";
import { paths } from "~/router";
import NotFound from "~/routes/[...404]";
import { Spinner } from "~/components/Loader/Spinner";
import { PlatformForm } from "../components/PlatformForm";
import { respond } from "@solidjs/web";
import { GET } from "@solidjs/web/server-functions";

// wrapper to override Cache-Control header
const q = GET(async (id: number) => {
    'use server'
    const platform = await getPlatformFn(id)
    return respond(platform, {
        headers: {
            "Cache-Control": "no-cache",
            ...(platform && {
                "Last-Modified": (platform.dateModified ?? platform.dateAdded).toUTCString()
            })            
        }
    })
})

export function AdminPlatformRoute() {
    const params = useParams(paths.admin.platforms)
    const platform = createMemo(() => q(parseInt(params.platformId)))

    return (
        <Loading fallback={<Spinner />}>
            <Show when={platform()} fallback={<NotFound />}>
                {platform => <PlatformForm platform={platform()} />}
            </Show>
        </Loading>
    )
}