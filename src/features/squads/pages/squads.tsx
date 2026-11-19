import { Show } from "@solidjs/web";
import { SquadList } from "../components/SquadList";
import { useSearchParams } from "@solidjs/router";
import { paths } from "~/router";

export function SquadsPage() {
    const [search] = useSearchParams(paths.squads)

    const filters = () => ({ ...search, gameId: Number(search?.gameId) || undefined })
    return (
        <Show when={filters()} keyed>
            {(f) => <SquadList filters={f} />}
        </Show>        
    )
}