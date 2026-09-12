import { and, eq, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "~/drizzle/db";
import { gameGenres, games } from "~/drizzle/schema";

export async function similarGames(gameId: number) {
    const targetGame = db
        .$with("target_game")
        .as(
            db
                .select({
                    gameId: games.gameId,
                    developerId: games.developerId
                })
                .from(games)
                .where(eq(games.gameId, gameId))
        )

    const ggTarget = alias(gameGenres, "gg_target")
    const ggOther = alias(gameGenres, "gg_other")

    const scores = db
        .$with("scores")
        .as(
            db
                .select({
                    otherGameId: ggOther.gameId,
                    points: sql<number>`COUNT(*) * 5`.as("points")
                })
                .from(ggTarget)
                .innerJoin(ggOther, eq(ggTarget.genre, ggOther.genre))
                .where(
                    and(
                        eq(ggTarget.gameId, gameId),
                        ne(ggOther.gameId, gameId)
                    )
                )
                .groupBy(ggOther.gameId)
        )

    return db
        .with(targetGame, scores)
        .select({
            gameId: games.gameId,
            title: games.title,
            cover: games.cover,
            points: sql<number>`COALESCE(${scores.points}, 0) + (CASE WHEN ${games.developerId} = ${targetGame.developerId} THEN 1 ELSE 0 END)`.as("points")
        })
        .from(games)
        .crossJoin(targetGame)
        .leftJoin(scores, eq(games.gameId, scores.otherGameId))
        .where(ne(games.gameId, gameId))
        .orderBy(sql`points DESC`)
        .limit(10)

}