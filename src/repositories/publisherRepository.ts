import { db } from "~/drizzle/db";

export async function findAll(filters?: {limit: number, offset: number}) {
    return await db.query.publishersView.findMany({
        ...filters
    })
}

export async function findById(publisherId: number) {
    return await db.query.publishersView.findFirst({
        where: {
            publisherId
        }
    })
}