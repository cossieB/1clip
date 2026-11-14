import { useSearchParams } from "@solidjs/router";
import { paths } from "~/router";
import { GetGamesSchema } from "../utils/zod";
import { GamesList } from "../components/GamesList";
import { httpHeader } from "@solidjs/web";

export function GamesPage() {
    const [_search] = useSearchParams(paths.games)
    const search = () => GetGamesSchema.catch(undefined).parse(_search)
    httpHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400")
    return <GamesList
        filters={search()}
    />
}