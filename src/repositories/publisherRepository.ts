import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { publishers } from "~/drizzle/schema";

export async function findAll(filters?: { limit: number, offset: number }) {
    return await db.query.publishers.findMany({
        orderBy: {
            name: "asc"
        },        
        ...filters
    })
}

export async function findById(publisherId: number) {
    return await db.query.publishers.findFirst({
        columns: {
            dateAdded: false,
            dateModified: false
        },
        where: {
            publisherId
        },
        orderBy: {
            name: "asc"
        }
    })
}

export async function editPublisher(publisherId: number, data: Partial<InferSelectModel<typeof publishers>>) {
    return db.update(publishers).set(data).where(eq(publishers.publisherId, publisherId))
}

export async function createPublisher(data: InferInsertModel<typeof publishers>) {
    const result = await db.insert(publishers).values(data).returning()
    return result[0]
}