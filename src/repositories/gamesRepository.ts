import { and, eq, getColumns, inArray, SQL, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { actors, developersView, gameActors, gamePlatforms, games, gamesView, gameTags, platforms, publishersView } from "~/drizzle/schema/schema";
import type { ActorView, PlatformView } from "~/models";

export async function findAll() {
    try {
        return gameUtil()
    } catch (error) {
        console.error(error)
        throw error
    }
}

export async function findById(gameId: number) {
    const list = await gameUtil({ filters: [eq(gamesView.gameId, gameId)] })
    return list.at(0)
}

export async function findByDeveloper(developerId: number) {
    return gameUtil({ filters: [eq(gamesView.developerId, developerId)] })
}

export async function findByPublisher(publisherId: number) {
    return gameUtil({ filters: [eq(gamesView.publisherId, publisherId)] })
}

export async function findByActor(actorId: number) {
    return gameUtil({
        filters: [
            inArray(
                gamesView.gameId,
                db
                    .select({ gameId: gameActors.gameId })
                    .from(gameActors)
                    .where(eq(gameActors.actorId, actorId))
            )]
    })
}

export async function findByPlatform(platformId: number) {
    return gameUtil({
        filters: [
            inArray(
                gamesView.gameId,
                db
                    .select({gameId: gamePlatforms.gameId})
                    .from(gamePlatforms)
                    .where(eq(gamePlatforms.platformId, platformId))
            )
        ]
    })
}

export async function findByTag(tag: string) {
    return gameUtil({
        filters: [
            inArray(
                gamesView.gameId,
                db
                    .select({gameId: gameTags.gameId})
                    .from(gameTags)
                    .where(eq(gameTags.tagName, tag))
            )
        ]
    })
}

function gameUtil(obj?: { filters?: SQL[] }) {
    const { developerId, publisherId, ...gamesColumns } = getColumns(gamesView)
    const actorQuery = db.$with("aq").as(
        db.select({
            gameId: gameActors.gameId,
            actorArr: sql`JSONB_AGG(JSONB_BUILD_OBJECT(
            'character', character,
            'actorId', ${actors.actorId},
            'name', ${actors.name},
            'photo', ${actors.photo},
            'bio', ${actors.bio}
        ) ORDER BY role_type)`.as("a_arr")
        })
            .from(gameActors)
            .innerJoin(actors, eq(gameActors.actorId, actors.actorId))
            .groupBy(gameActors.gameId)
    )

    const platformQuery = db.$with("pq").as(
        db.select({
            gameId: gamePlatforms.gameId,
            platformArr: sql`JSONB_AGG(JSONB_BUILD_OBJECT(
            'platformId', ${platforms.platformId},
            'name', ${platforms.name},
            'logo', ${platforms.logo},
            'summary', ${platforms.summary},
            'releaseDate', ${platforms.releaseDate}
        ))`.as("p_arr")
        })
            .from(gamePlatforms)
            .innerJoin(platforms, eq(gamePlatforms.platformId, platforms.platformId))
            .groupBy(gamePlatforms.gameId)
    )

    const tagQuery = db.$with("tq").as(
        db.select({
            gameId: gameTags.gameId,
            tags: sql`ARRAY_AGG(game_tags.tag_name ORDER BY game_tags.tag_name)`.as("tags")
        })
            .from(gameTags)
            .groupBy(gameTags.gameId)
    )

    const gamesQuery = db
        .with(actorQuery, platformQuery, tagQuery)
        .select({
            ...gamesColumns,
            publisher: { ...getColumns(publishersView) },
            developer: { ...getColumns(developersView) },
            tags: sql<string[]>`COALESCE(${tagQuery.tags}, '{}')`,
            platforms: sql<PlatformView[]>`COALESCE(${platformQuery.platformArr}, '{}')`,
            actors: sql<(ActorView & { character: string })[]>`COALESCE(${actorQuery.actorArr}, '{}')`
        })
        .from(gamesView)
        .innerJoin(developersView, eq(gamesView.developerId, developersView.developerId))
        .innerJoin(publishersView, eq(gamesView.publisherId, publishersView.publisherId))
        .leftJoin(actorQuery, eq(gamesView.gameId, actorQuery.gameId))
        .leftJoin(platformQuery, eq(gamesView.gameId, platformQuery.gameId))
        .leftJoin(tagQuery, eq(gamesView.gameId, tagQuery.gameId))
        .where(and(...(obj?.filters ?? [])))

    return gamesQuery
}