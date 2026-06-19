import { Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import { GamesList } from "~/features/games/components/GamesList";
import titleCase from "~/lib/titleCase";

export default function GamesByGenreRoute() {
    const params = useParams()
    return (
        <>
        <Title> {titleCase(decodeURIComponent(params.genre!))} </Title>
        <GamesList filters={{genre: decodeURIComponent(params.genre!)}} />
        </>
    )
}