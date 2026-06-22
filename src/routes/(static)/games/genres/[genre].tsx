import { useParams } from "@solidjs/router";
import { MySiteTitle } from "~/components/MySiteTitle";
import { GamesList } from "~/features/games/components/GamesList";
import titleCase from "~/lib/titleCase";

export default function GamesByGenreRoute() {
    const params = useParams()
    return (
        <>
        <MySiteTitle> {titleCase(decodeURIComponent(params.genre!))} Games </MySiteTitle>
        <GamesList filters={{genre: decodeURIComponent(params.genre!)}} />
        </>
    )
}