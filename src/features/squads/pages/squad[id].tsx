import { useNavigate, useParams } from "@solidjs/router"
import { createMemo, Loading, Show } from "solid-js"
import { NotFound } from "~/components/NotFound/NotFound"
import { SquadSkeleton } from "~/components/Skeletons/Skeletons"
import { paths } from "~/router"
import { SquadBlock } from "../components/SquadBlock"
import { getSquadFn } from "../squadsApi"

export function SquadIdRoute() {
    const params = useParams(paths.squads)
    const squad = createMemo(() => getSquadFn(Number(params.squadId)))
    const navigate = useNavigate()
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