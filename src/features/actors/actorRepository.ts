import { and, eq, getColumns, InferInsertModel, InferSelectModel, notInArray, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { actors, appearances, games } from "~/drizzle/schema";

export function findById(actorId: number) {
    return db.query.actors.findFirst({
        where: {
            actorId
        }
    })
}

export async function findAll(filters?: { limit?: number, offset?: number }) {
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
            await tx.insert(appearances).values(characters.map(char => ({ ...char, actorId: a.actorId })))
        return a
    })
}

export async function editActor(actorId: number, actor: Partial<InferSelectModel<typeof actors>>, characters?: Char[]) {
    if (!characters) return db.update(actors).set(actor).where(eq(actors.actorId, actorId)).returning({
        oldPhoto: sql<string | null>`OLD.photo`
    })

    return db.transaction(async tx => {
        const a = await tx.update(actors).set(actor).where(eq(actors.actorId, actorId)).returning({
            oldPhoto: sql<string | null>`OLD.photo`
        })
        if (characters.length == 0)
            await tx.delete(appearances).where(eq(appearances.actorId, actorId))

        else {
            await tx.delete(appearances).where(and(
                eq(appearances.actorId, actorId),
                notInArray(appearances.appearanceId, characters.map(ch => ch.appearanceId).filter(Boolean) as number[])
            ))
            await tx.insert(appearances).values(characters.map(char => ({
                actorId,
                gameId: char.gameId,
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
        return a
    })
};

export async function findActorWithGames(actorId: number) {
    const gamesQuery = db.$with("gq").as(
        db.select({
            actorId: appearances.actorId,
            characters: sql`JSONB_AGG(JSONB_BUILD_OBJECT(
                'appearanceId', ${appearances.appearanceId},
                'gameId', ${games.gameId},
                'title', ${games.title},
                'character', ${appearances.character},
                'roleType', ${appearances.roleType}
            ))`.as('chars')
        })
            .from(appearances)
            .innerJoin(games, eq(appearances.gameId, games.gameId))
            .groupBy(appearances.actorId)
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