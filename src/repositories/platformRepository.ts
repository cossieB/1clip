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

export function createPlatform(platform: InferInsertModel<typeof platforms>) {
    return db.insert(platforms).values(platform).returning()
}

export function editPlatform(platformId: number, data: Partial<InferSelectModel<typeof platforms>>) {
    return db.update(platforms).set(data).where(eq(platforms.platformId, platformId))
}