import { PhotoCardGrid } from "../../../components/CardLink/PhotoCardLink"
import { useGamesQuery } from "~/features/games/hooks/useGameQuery"
import { STORAGE_DOMAIN } from "~/utils/env"
import { GameQueryFilters } from "~/repositories/gamesRepository"
import { createEffect, onMount } from "solid-js"


export function GamesList(props: { filters: GameQueryFilters }) {
    const result = useGamesQuery(props.filters)
    let observer: IntersectionObserver
    let lastItem: HTMLDivElement | undefined

    onMount(() => {
        observer = new IntersectionObserver(entries => {
            if (entries.at(-1)!.isIntersecting) 
                result.fetchNextPage()
        })
    })

    createEffect(() => {
        if (result.data) {
            const cards = document.querySelectorAll<HTMLDivElement>(`[data-type="card"]`)
            if (cards.length == 0) return;
            lastItem && observer?.unobserve(lastItem)
            lastItem = cards[cards.length - 1]
            observer?.observe(lastItem)
        }
    })

    return <PhotoCardGrid
        arr={result.data?.pages.flat() ?? []}
        getLabel={game => game.title}
        getPic={game => STORAGE_DOMAIN + game.cover}
        getParam={game => ({
            gameId: game.gameId
        })}
        to='/games/$gameId'
    />
}