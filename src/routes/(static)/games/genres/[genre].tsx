import { useParams } from "@solidjs/router";
import { GamesList } from "~/features/games/components/GamesList";

export default function GamesByGenreRoute() {
    const params = useParams()
    return <GamesList filters={{genre: decodeURIComponent(params.genre!)}} />
}