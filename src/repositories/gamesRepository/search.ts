'use server'

import { sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { games } from "~/drizzle/schema";

export function searchGames(query: string) {
    return db.select({
        title: games.title,
        cover: games.cover,
        gameId: games.gameId,
        releaseDate: games.releaseDate
    })
        .from(games)
        .where(sql`${games.searchVector} @@ websearch_to_tsquery('english', ${query})`)
        .limit(50)
}