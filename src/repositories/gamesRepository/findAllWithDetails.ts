'use server'

import { eq, inArray, lt, SQL } from "drizzle-orm"
import { type GameQueryFilters } from "./types"
import { gameActors, gameGenres, gamePlatforms, games } from "~/drizzle/schema"
import { db } from "~/drizzle/db"
import { detailedGames } from "./detail"

export async function findGamesWithDetails(obj: GameQueryFilters = {}) {
    const filters: SQL[] = []
    if (obj.developerId)
        filters.push(eq(games.developerId, obj.developerId))
    if (obj.publisherId)
        filters.push(eq(games.publisherId, obj.publisherId))
    if (obj.actorId)
        filters.push(inArray(
            games.gameId,
            db
                .select({ gameId: gameActors.gameId })
                .from(gameActors)
                .where(eq(gameActors.actorId, obj.actorId))
        ))
    if (obj.platformId)
        filters.push(inArray(
            games.gameId,
            db
                .select({ gameId: gamePlatforms.gameId })
                .from(gamePlatforms)
                .where(eq(gamePlatforms.platformId, obj.platformId))
        ))
    if (obj.genre)
        filters.push(inArray(
            games.gameId,
            db
                .select({ gameId: gameGenres.gameId })
                .from(gameGenres)
                .where(eq(gameGenres.genre, obj.genre))
        ))
    if (obj.cursor)
        filters.push(lt(games.gameId, obj.cursor))
    return detailedGames({ filters, limit: obj.limit })
}