import { useSearchParams } from "@solidjs/router";
import { useQuery } from "@tanstack/solid-query";
import { Suspense } from "solid-js";
import { PhotoCardGrid } from "~/components/CardLink/PhotoCardLink";
import { searchGamesFn } from "~/services/gamesService";
import { STORAGE_DOMAIN } from "~/utils/env";

export default function SearchGamesRoute() {
    const [search] = useSearchParams();
    const s = () => Array.isArray(search.s) ? search.s[0] : search.s

    const result = useQuery(() => ({
        enabled: () => !!s(),
        queryFn: () => searchGamesFn(s() ?? "" ),
        queryKey: ["games", "search", s()]
    }))

    return (
        <Suspense>
            <PhotoCardGrid
                arr={result.data ?? []}
                getLabel={game => game.title}
                getPic={game => STORAGE_DOMAIN + game.cover}
                getHref={game => "/games/" + game.gameId}
            />
        </Suspense>        
    )
}