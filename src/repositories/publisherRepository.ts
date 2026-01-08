import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { publishers } from "~/drizzle/schema";

export async function findAll(filters?: {limit: number, offset: number}) {
    return await db.query.publishers.findMany({
        columns: {
            dateAdded: false,
            dateModified: false
        },
        ...filters
    })
}

export async function findById(publisherId: number) {
    return await db.query.publishers.findFirst({
        where: {
            publisherId
        }
    })
}

export async function editPublisher(publisherId: number, data: Partial<InferSelectModel<typeof publishers>>) {
    return db.update(publishers).set(data).where(eq(publishers.publisherId, publisherId))
}

export async function createPublisher(data: InferInsertModel<typeof publishers>) {
    return db.insert(publishers).values(data).returning()
}