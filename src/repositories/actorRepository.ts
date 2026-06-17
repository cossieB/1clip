'use server'

import { and, eq, getColumns, InferInsertModel, InferSelectModel, notInArray, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { actors, gameActors, games } from "~/drizzle/schema";

export function findById(actorId: number) {
    return db.query.actors.findFirst({
        where: {
            actorId
        }
    })
}

export async function findAll(filters?: {limit?: number, offset?: number}) {
    return db.query.actors.findMany(filters)
}

type Char = {
    appearanceId?: number
    gameId: number;
    character: string;
    roleType: "player character" | "major character" | "minor character";
};

export function createActor(actor: InferInsertModel<typeof actors>, characters: Omit<Char, 'appearanceId'>[]) {
    return db.transaction(async tx => {
        const [a] = await tx.insert(actors).values(actor).returning()
        if (characters.length > 0)
            await tx.insert(gameActors).values(characters.map(char => ({ ...char, actorId: a.actorId })))
        return a
    })
}

export async function editActor(actorId: number, actor: Partial<InferSelectModel<typeof actors>>, characters?: Char[]) {
    if (!characters) return db.update(actors).set(actor).where(eq(actors.actorId, actorId))

    await db.transaction(async tx => {
        await tx.update(actors).set(actor).where(eq(actors.actorId, actorId))
        if (characters.length == 0)
            await tx.delete(gameActors).where(eq(gameActors.actorId, actorId))

        else {
            await tx.delete(gameActors).where(and(
                eq(gameActors.actorId, actorId),
                notInArray(gameActors.appearanceId, characters.map(ch => ch.appearanceId).filter(Boolean) as number[])
            ))
            await tx.insert(gameActors).values(characters.map(char => ({
                actorId,
                gameId: char.gameId,
                character: char.character
            }))).onConflictDoNothing()
        }
    })
};

export async function findActorWithGames(actorId: number) {
    const gamesQuery = db.$with("gq").as(
        db.select({
            actorId: gameActors.actorId,
            characters: sql`JSONB_AGG(JSONB_BUILD_OBJECT(
                'appearanceId', ${gameActors.appearanceId},
                'gameId', ${games.gameId},
                'title', ${games.title},
                'character', ${gameActors.character},
                'roleType', ${gameActors.roleType}
            ))`.as('chars')
        })
            .from(gameActors)
            .innerJoin(games, eq(gameActors.gameId, games.gameId))
            .groupBy(gameActors.actorId)
    )

    const actor = await db.with(gamesQuery).select({
        ...getColumns(actors),
        characters: sql<{ appearanceId: number, gameId: number, title: string, character: string, roleType: RoleType }[]>`COALESCE(${gamesQuery.characters}, '[]'::JSONB)`.as("chars")
    })
        .from(actors)
        .leftJoin(gamesQuery, eq(actors.actorId, gamesQuery.actorId))
        .where(eq(actors.actorId, actorId))

    return actor.at(0)
}

type RoleType = "player character" | "major character" | "minor character"