import { eq, getColumns, InferInsertModel, InferSelectModel, SQL, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { platforms } from "~/drizzle/schema";

export function findAll(filters?: { limit?: number, offset?: number }) {
    return db.query.platforms.findMany({
        orderBy: {
            name: 'asc'
        },
        ...filters
    })
}

export function findById(platformId: number) {
    return db.query.platforms.findFirst({
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
    return db
        .update(platforms).set({
            ...data,
            dateModified: sql`NOW()`
        })
        .where(eq(platforms.platformId, platformId))
        .returning({
            oldLogo: sql.raw(`OLD.${platforms.logo.name}`) as SQL<string>,
            ...getColumns(platforms)
        })
}