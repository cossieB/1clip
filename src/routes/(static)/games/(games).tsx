import { MySiteTitle } from "~/components/MySiteTitle";
import { GamesList } from "~/features/games/components/GamesList";

export default function GamesRoute() {
    return (
        <>
            <MySiteTitle>Games</MySiteTitle>
            <GamesList />
        </>
    )
}