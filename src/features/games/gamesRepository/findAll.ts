import { db } from "~/drizzle/db";
import { GameQueryFilters } from "./types";
import { SQL, and, eq, getColumns, ilike, inArray, lt, sql } from "drizzle-orm";
import { games, appearances, gamePlatforms, gameGenres } from "~/drizzle/schema";

export async function findAll(obj: GameQueryFilters = {}) {
    const filters: SQL[] = []
    if (obj.developerId)
        filters.push(eq(games.developerId, obj.developerId))
    if (obj.publisherId)
        filters.push(eq(games.publisherId, obj.publisherId))
    if (obj.actorId)
        filters.push(inArray(
            games.gameId,
            db
                .select({ gameId: appearances.gameId })
                .from(appearances)
                .where(eq(appearances.actorId, obj.actorId))
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

    if (obj.title)
        filters.push(ilike(games.title, `%${obj.title}%`))

    if (obj.fullTextQuery)
        filters.push(sql`${games.searchVector} @@ websearch_to_tsquery('english', ${obj.fullTextQuery})`)

    const {searchVector, dateModified, dateAdded, ...rest} = getColumns(games)

    return db
        .select(rest)
        .from(games)
        .where(and(...filters))
}