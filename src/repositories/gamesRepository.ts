import { and, eq, getColumns, SQL, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { actors, developersView, gameActors, gamePlatforms, gamesView, gameTags, platforms, publishersView } from "~/drizzle/schema";
import { sleep } from "~/lib/sleep";
import type { ActorView, PlatformView } from "~/models";

function gameUtil(obj?: { filters?: SQL[] }) {
    const { developerId, publisherId, ...gamesColumns } = getColumns(gamesView)
    const actorQuery = db.$with("aq").as(
        db.select({
            gameId: gameActors.gameId,
            actorArr: sql`ARRAY_AGG(JSON_BUILD_OBJECT(
            'actorId', ${actors.actorId},
            'name', ${actors.name},
            'photo', ${actors.photo},
            'bio', ${actors.bio}
        ))`.as("a_arr")
        })
            .from(gameActors)
            .innerJoin(actors, eq(gameActors.actorId, actors.actorId))
            .groupBy(gameActors.gameId)
    )

    const platformQuery = db.$with("pq").as(
        db.select({
            gameId: gamePlatforms.gameId,
            platformArr: sql`ARRAY_AGG(JSON_BUILD_OBJECT(
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
            actors: sql<ActorView[]>`COALESCE(${actorQuery.actorArr}, '{}')`
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