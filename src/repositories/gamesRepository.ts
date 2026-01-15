import { and, desc, eq, getColumns, gt, inArray, InferInsertModel, InferSelectModel, lt, notInArray, SQL, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { gameActors, gamePlatforms, gameGenres, actors, platforms, media, games, publishers, developers, genres } from "~/drizzle/schema/schema";
import { Actor, Platform } from "~/drizzle/models";

export type GameQueryFilters = {
    developerId?: number
    publisherId?: number
    actorId?: number
    platformId?: number
    genre?: string
    limit?: number
    cursor?: number
}

export async function findAll() {
    return db.query.games.findMany({
        columns: {
            title: true,
            gameId: true
        },
        orderBy: {
            title: 'asc'
        }
    })
}

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

export async function findById(gameId: number) {
    const list = await detailedGames({ filters: [eq(games.gameId, gameId)] })
    return list.at(0)
}

type GameInsert = {
    platforms: number[]
    genres: string[]
    media: { key: string, contentType: string }[]
}

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

export async function updateGame(gameId: number, game: Partial<InferSelectModel<typeof games>>, other: Partial<GameInsert>) {
    return db.transaction(async tx => {
        await tx.update(games).set(game).where(eq(games.gameId, gameId))
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
            else
                await tx.insert(media).values(other.media.map(m => ({ ...m, gameId }))).onConflictDoNothing()
        }
    })
}

type Args = {
    filters: SQL[]
    limit?: number
}

function detailedGames(obj: Args = { filters: []}) {
    const gamesColumns = getColumns(games)
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
            media: sql<{ key: string, contentType: string }[]>`JSONB_AGG(JSONB_BUILD_OBJECT(
                'key', ${media.key},
                'contentType', ${media.contentType}
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
            media: sql<{ key: string, contentType: string }[]>`COALESCE(${mediaQuery.media}, '[]'::JSONB)`
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