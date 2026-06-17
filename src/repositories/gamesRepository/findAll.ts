"use server"

import { db } from "~/drizzle/db";

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