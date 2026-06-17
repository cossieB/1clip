"use server"

import { and, desc, eq, getColumns, SQL, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { gameActors, gamePlatforms, gameGenres, actors, platforms, media, games, publishers, developers, genres } from "~/drizzle/schema/schema";
import { Actor, Platform } from "~/drizzle/models";

type Args = {
    filters: SQL[]
    limit?: number
}

export function detailedGames(obj: Args = { filters: [] }) {
    const { searchVector, ...gamesColumns } = getColumns(games)
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

    const genresQuery = db.$with("tq").as(
        db.select({
            gameId: gameGenres.gameId,
            tags: sql`ARRAY_AGG(game_genres.genre ORDER BY game_genres.genre)`.as("tags")
        })
            .from(gameGenres)
            .groupBy(gameGenres.gameId)
    )

    const mediaQuery = db.$with("mq").as(
        db.select({
            gameId: media.gameId,
            media: sql`JSONB_AGG(JSONB_BUILD_OBJECT(
                'key', ${media.key},
                'contentType', ${media.contentType},
                'metadata', ${media.metadata}
            ))`.as("m_arr")
        })
            .from(media)
            .groupBy(media.gameId)
    )

    const gamesQuery = db
        .with(actorQuery, platformQuery, genresQuery, mediaQuery)
        .select({
            ...gamesColumns,
            publisher: { ...getColumns(publishers) },
            developer: { ...getColumns(developers) },
            genres: sql<string[]>`COALESCE(${genresQuery.tags}, '{}')`,
            platforms: sql<Platform[]>`COALESCE(${platformQuery.platformArr}, '[]'::JSONB)`,
            actors: sql<(Actor & { character: string })[]>`COALESCE(${actorQuery.actorArr}, '[]'::JSONB)`,
            media: sql<{ key: string, contentType: string, metadata: Record<string, string> }[]>`COALESCE(${mediaQuery.media}, '[]'::JSONB)`
        })
        .from(games)
        .innerJoin(developers, eq(games.developerId, developers.developerId))
        .innerJoin(publishers, eq(games.publisherId, publishers.publisherId))
        .leftJoin(actorQuery, eq(games.gameId, actorQuery.gameId))
        .leftJoin(platformQuery, eq(games.gameId, platformQuery.gameId))
        .leftJoin(genresQuery, eq(games.gameId, genresQuery.gameId))
        .leftJoin(mediaQuery, eq(games.gameId, mediaQuery.gameId))
        .where(and(...obj.filters))
        .orderBy(desc(games.gameId))
        .limit(obj.limit ?? 50)

    return gamesQuery
}