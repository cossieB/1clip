import { useSearchParams } from "@solidjs/router";
import { paths } from "~/router";
import { GetGamesSchema } from "../utils/zod";
import { GamesList } from "../components/GamesList";

export function GamesPage() {
    const [_search] = useSearchParams(paths.games)
    const search = () => GetGamesSchema.catch(undefined).parse(_search)
    return <GamesList
        filters={search()}
    />
}