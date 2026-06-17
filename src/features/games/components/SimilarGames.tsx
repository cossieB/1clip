import { useQuery } from "@tanstack/solid-query"
import { createSignal } from "solid-js"
import { PhotoCardGrid } from "~/components/CardLink/PhotoCardLink"
import { useInView } from "~/hooks/useInView"
import { getSimilarGames } from "~/services/gamesService"
import { STORAGE_DOMAIN } from "~/utils/env"

export default function SimilarGames(props: { gameId: number }) {
    const [ref, setRef] = createSignal<HTMLDivElement>()
    const isInView = useInView(ref)

    const result = useQuery(() => ({
        enabled: isInView(),
        queryKey: ["games", "similarTo", props.gameId],
        queryFn: () => getSimilarGames(props.gameId)
    }))

    return (
        <div ref={setRef}>

            <PhotoCardGrid
                arr={result.data ?? []}
                getLabel={game => game.title}
                getPic={game => STORAGE_DOMAIN + game.cover}
                getHref={game => "/games/" + game.gameId}
            />
        </div>
    )
}