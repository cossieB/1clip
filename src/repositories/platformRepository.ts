import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { platforms } from "~/drizzle/schema";

export function findAll() {
    return db.query.platforms.findMany({
        orderBy: {
            releaseDate: 'desc'
        }
    })
}

export function findById(platformId: number) {
    return db.query.platforms.findFirst({
        columns: {
            dateAdded: false,
            dateModified: false
        },
        where: {
            platformId
        }
    })
}

export async function createPlatform(platform: InferInsertModel<typeof platforms>) {
    const result = await db.insert(platforms).values(platform).returning();
    return result[0]
}

export function editPlatform(platformId: number, data: Partial<InferSelectModel<typeof platforms>>) {
    return db.update(platforms).set(data).where(eq(platforms.platformId, platformId))
}