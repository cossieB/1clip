import { createMemo, createSignal, For, Loading, refresh } from "solid-js";
import { getSquadsFn } from "../squadsApi";
import { SquadBlock } from "./SquadBlock";
import { session } from "~/features/auth/authApi";

export function SquadList() {
    const [cursor, setCursor] = createSignal<number>()
    const squads = createMemo(() => getSquadsFn({
        cursor: cursor()
    }), {
        id: "squadId"
    })


    return (
        <Loading>
            <For each={squads()}>
                {squad => <SquadBlock
                    squad={squad}
                    userId={session().data?.user.id ?? null}
                />}
            </For>
        </Loading>
    )

}