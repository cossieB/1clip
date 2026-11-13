import { createEffect, createMemo, createSignal, For, Loading, onSettled, refresh } from "solid-js";
import { getSquadsFn } from "../squadsApi";
import { SquadBlock } from "./SquadBlock";
import { session } from "~/features/auth/authApi";
import { AwaitedReturn } from "~/lib/utilityTypes";

type Props = {
    filters?: {
        gameId?: number
        userId?: string
        username?: string
    }
}

export function SquadList(props: Props) {
    const [cursor, setCursor] = createSignal<number>()
    let done = false
    let lastItem: HTMLElement | undefined
    
    const squads = createMemo(async (prev: AwaitedReturn<typeof getSquadsFn> = []) => {
        const next = await getSquadsFn({
            ...props.filters,
            cursor: cursor()
        })
        return [...prev, ...next]
    }, {
        id: "squadId"
    })

    let observer: IntersectionObserver

    createEffect(
        () => squads().length,
        () => {
            setTimeout(() => {
                const cards = document.querySelectorAll<HTMLElement>(`[data-squad-id]`);
                if (cards.length === 0) return;
                lastItem && observer?.unobserve(lastItem);
                lastItem = cards[cards.length - 1];
                observer?.observe(lastItem);
            }, 50)
        }
    )

    onSettled(() => {
        observer = new IntersectionObserver(entries => {
            const last = entries.at(-1);
            if (last?.isIntersecting && !done) {
                const squadId = Number((last.target as HTMLElement).dataset.squadId);
                const item = squads().find(squad => squad.squadId === squadId);
                if (item) setCursor(squadId)
            }
        })
        return () => observer?.disconnect()
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