import { db } from "~/drizzle/db";

export async function findAll(filters?: {limit: number, offset: number}) {
    return await db.query.developersView.findMany({
        ...filters
    })
}

export async function findById(developerId: number) {
    return await db.query.developersView.findFirst({
        where: {
            developerId
        }
    })
}