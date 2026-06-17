import { Title } from "@solidjs/meta";
import { GamesList } from "~/features/games/components/GamesList";

export default function GamesRoute() {
    return (
        <>
            <Title>Games</Title>
            <GamesList />
        </>
    )
}