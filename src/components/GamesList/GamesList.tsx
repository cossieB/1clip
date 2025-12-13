import { For } from "solid-js"
import type { findAll } from "~/repositories/gamesRepository"
import styles from "./GamesList.module.css"
import { Link } from "@tanstack/solid-router"

type Props = {
    games: Awaited<ReturnType<typeof findAll>>
}

export function GamesList(props: Props) {
    return (
        <div class={styles.grid} >
            <For each={props.games}>
                {game => <GameCard game={game} />}
            </For>
        </div>
    )
}

function GameCard(props: { game: Props["games"][number] }) {
    return (
        <div  class={styles.card}>
            <div class={styles.imgWrapper}><img src={props.game.cover} alt="" /></div>
            <label> {props.game.title} </label>
            <Link class={styles.a} to={`/games/$gameId`} params={{gameId: props.game.gameId}} />
        </div>
    )
}