import z from "zod";
import { GetGamesSchema } from "../utils/zod";
import { createEffect, createMemo, createSignal, For, Loading, onSettled } from "solid-js";
import { getGamesFn } from "../gamesApi";
import { AwaitedReturn } from "~/lib/utilityTypes";
import { mediaSrc } from "~/utils/mediaSrc";
import { paths } from "~/router";
import { PhotoCardGrid } from "~/components/CardLink/PhotoCardLink";

type G = AwaitedReturn<typeof getGamesFn>

export function GamesList(props: { filters: z.input<typeof GetGamesSchema> }) {
    let done = false
    const [cursor, setCursor] = createSignal<number>()
    const games = createMemo(async (prev: G = []) => {
        const next = await getGamesFn({
            ...props.filters,
            limit: 20,
            cursor: cursor()
        })
        if (next.length === 0) done = true
        return [...prev, ...next]
    })

    let observer: IntersectionObserver
    let lastItem: HTMLElement | undefined

    createEffect(
        () => games().length,
        () => {
            setTimeout(() => {
                const cards = document.querySelectorAll<HTMLElement>(`[data-game-id]`);
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
                const gameId = Number((last.target as HTMLElement).dataset.gameId);
                const item = games().find(game => game.gameId === gameId); 
                if (item) setCursor(gameId)
            }
        })
        return () => observer?.disconnect()
    })
    return (
        <PhotoCardGrid
            arr={games()}
            getLabel={game => game.title}
            getPic={game => game.cover}
            getHref={game => paths.games(game.gameId)()}
            getAttr={game => ({
                [`data-game-id`]: game.gameId.toString()
            })}
        />
    )
}

function GameBlock(props: { game: G[number] }) {
    return (
        <a href={paths.games(props.game.gameId)} data-game-id={props.game.gameId}>
            <img src={mediaSrc(props.game.cover)} alt={`${props.game.title} cover`} />
            <label > {props.game.title} </label>
        </a>
    )
}