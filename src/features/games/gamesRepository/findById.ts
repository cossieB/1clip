import { eq } from "drizzle-orm"
import { games } from "~/drizzle/schema"
import { detailedGames } from "./detail"

export async function findById(gameId: number) {
    const list = await detailedGames({ filters: [eq(games.gameId, gameId)] })
    return list.at(0)
}