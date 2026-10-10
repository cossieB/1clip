import { db } from "~/drizzle/db";

export async function findAll(titleSearch?: string) {
    return db.query.games.findMany({
        columns: {
            title: true,
            gameId: true
        },
        orderBy: {
            title: 'asc'
        },
        where: {
            title: {
                ilike: `%${titleSearch}%`
            }
        }
    })
}