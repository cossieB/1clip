import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { developers } from "~/drizzle/schema";

export async function findAll(filters?: { limit: number, offset: number }) {
    return await db.query.developers.findMany({
        orderBy: {
            name: "asc"
        },
        ...filters
    })
}

export async function findById(developerId: number) {
    return await db.query.developers.findFirst({
        columns: {
            dateAdded: false,
            dateModified: false
        },
        where: {
            developerId
        },

    })
}

export async function editDeveloper(developerId: number, data: Partial<InferSelectModel<typeof developers>>) {
    return db.update(developers).set(data).where(eq(developers.developerId, developerId))
}

export async function createDeveloper(data: InferInsertModel<typeof developers>) {
    return db.insert(developers).values(data).returning()
}