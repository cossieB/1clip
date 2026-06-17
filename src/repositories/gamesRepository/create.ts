"use server"

import { InferInsertModel } from "drizzle-orm"
import { GameInsert } from "./types"
import { gameGenres, gamePlatforms, games, genres, media } from "~/drizzle/schema"
import { db } from "~/drizzle/db"

export async function createGame(game: InferInsertModel<typeof games>, other: GameInsert) {
    return db.transaction(async tx => {
        const g = (await tx.insert(games).values(game).returning())[0]
        if (other.genres.length > 0) {
            await tx.insert(genres).values(other.genres.map(x => ({ name: x }))).onConflictDoNothing()
            await tx.insert(gameGenres).values(other.genres.map(genre => ({ gameId: g.gameId, genre })))
        }
        if (other.media.length > 0)
            await tx.insert(media).values(other.media.map(m => ({
                ...m,
                gameId: g.gameId
            })))
        if (other.platforms.length > 0)
            await tx.insert(gamePlatforms).values(other.platforms.map(platformId => ({ platformId, gameId: g.gameId })))

        return g.gameId
    })
}