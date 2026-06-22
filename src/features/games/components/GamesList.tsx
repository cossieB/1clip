import { PhotoCardGrid } from "../../../components/CardLink/PhotoCardLink"
import { useGamesQuery } from "~/features/games/hooks/useGameQuery"
import { STORAGE_DOMAIN } from "~/utils/env"
import { type GameQueryFilters } from "~/repositories/gamesRepository"
import { createEffect, onCleanup, onMount } from "solid-js"
import { sleep } from "~/lib/sleep"


export function GamesList(props: { filters?: GameQueryFilters }) {
    const result = useGamesQuery(props.filters)
    let observer: IntersectionObserver
    let lastItem: HTMLDivElement | undefined

    onMount(() => {
        observer = new IntersectionObserver(entries => {
            if (entries.at(-1)!.isIntersecting) 
                result.fetchNextPage()
        })
        onCleanup(() => observer?.disconnect())
    })

    createEffect(() => {
        if (result.data) {
            // Ensure cards are rendered first. 
            setTimeout(() => {
                const cards = document.querySelectorAll<HTMLDivElement>(`[data-type="card"]`)                
                if (cards.length == 0) return;
                lastItem && observer?.unobserve(lastItem)
                lastItem = cards[cards.length - 1]
                observer?.observe(lastItem)
            }, 0)
        }
    })

    return <PhotoCardGrid
        arr={result.data?.pages.flat() ?? []}
        getLabel={game => game.title}
        getPic={game => STORAGE_DOMAIN + game.cover}
        getHref={game => "/games/" + game.gameId}        
    />
}