import { useNavigate, useParams } from "@solidjs/router"
import { httpHeader } from "@solidjs/web"
import { createMemo, Loading, Show, untrack } from "solid-js"
import { NotFound } from "~/components/NotFound/NotFound"
import { SquadSkeleton } from "~/components/Skeletons/Skeletons"
import { paths } from "~/router"
import { SquadBlock } from "../components/SquadBlock"
import { getSquadFn } from "../squadsApi"

export function SquadIdRoute() {
    const params = useParams(paths.squads)
    const squad = createMemo(() => getSquadFn(Number(params.squadId)))
    const navigate = useNavigate()
    httpHeader("Cache-Control", "private, max-age=600");
    return (
        <Loading fallback={<SquadSkeleton />}>
            <Show
                fallback={<NotFound />}
                when={squad()}
            >
                {squad => 
                    <div>
                        <SquadBlock squad={squad()} onDelete={() => navigate(paths.squads())} />
                    </div>
                }
            </Show>
        </Loading>
    )
}