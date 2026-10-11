import { and, eq, InferSelectModel, notInArray, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { gamePlatforms, gameGenres, media, games, genres, appearances } from "~/drizzle/schema/schema";
import { type GameInsert } from "./types";

export async function updateGame(gameId: number, game: Partial<InferSelectModel<typeof games>>, other: Partial<GameInsert>) {

    return db.transaction(async tx => {
        const old = await tx.update(games).set(game).where(eq(games.gameId, gameId)).returning({
            oldCover: sql<string>`OLD.cover`,
            oldBanner: sql<string>`OLD.banner`
        })
        if (other.platforms) {
            if (other.platforms.length === 0) {
                await tx.delete(gamePlatforms).where(eq(gamePlatforms.gameId, gameId));
            }
            else {
                await tx.delete(gamePlatforms)
                    .where(
                        and(
                            eq(gamePlatforms.gameId, gameId),
                            notInArray(gamePlatforms.platformId, other.platforms)
                        )
                    );
                await tx.insert(gamePlatforms)
                    .values(other.platforms.map((platformId) => ({
                        gameId,
                        platformId
                    })))
                    .onConflictDoNothing({
                        target: [gamePlatforms.gameId, gamePlatforms.platformId]
                    });
            }
        }
        if (other.genres) {
            if (other.genres.length == 0)
                await tx.delete(gameGenres).where(eq(gameGenres.gameId, gameId))
            else {
                await tx.insert(genres)
                    .values(other.genres.map(name => ({
                        name
                    })))
                    .onConflictDoNothing()
                await tx.delete(gameGenres)
                    .where(
                        and(
                            eq(gameGenres.gameId, gameId),
                            notInArray(gameGenres.genre, other.genres)
                        )
                    )
                await tx.insert(gameGenres)
                    .values(other.genres.map(genre => ({ genre, gameId })))
                    .onConflictDoNothing({
                        target: [gameGenres.gameId, gameGenres.genre]
                    })
            }
        }
        if (other.media) {
            if (other.media.length == 0)
                await tx.update(media).set({ gameId: null }).where(eq(media.gameId, gameId))
            else {
                await tx
                    .update(media)
                    .set({ gameId: null })
                    .where(
                        and(
                            eq(media.gameId, gameId),
                            notInArray(media.key, other.media.map(m => m.key))
                        )
                    )
                await tx
                    .insert(media)
                    .values(other.media.map(m => ({ ...m, gameId })))
                    .onConflictDoUpdate({
                        set: {
                            contentType: sql.raw(`EXCLUDED.${media.contentType.name}`),
                            metadata: sql.raw(`EXCLUDED.${media.metadata.name}`),
                        },
                        target: media.key
                    })
            }
        }

        if (other.characters) {
            if (other.characters.length === 0)
                await tx.delete(appearances).where(eq(appearances.gameId, gameId))
            else {
                await tx.delete(appearances).where(and(
                    eq(appearances.gameId, gameId),
                    notInArray(appearances.appearanceId, other.characters.map(ch => ch.appearanceId).filter(Boolean) as number[])
                ))
                await tx.insert(appearances).values(other.characters.map(char => ({
                    gameId,
                    actorId: char.actorId,
                    character: char.character,
                    roleType: char.roleType
                }))).onConflictDoUpdate({
                    target: [appearances.gameId, appearances.actorId],
                    set: {
                        character: sql.raw(`EXCLUDED.${appearances.character.name}`),
                        roleType: sql.raw(`EXCLUDED.${appearances.roleType.name}`)
                    }
                })
            }
        }
        return old
    })
}