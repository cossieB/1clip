import { eq, getColumns, InferInsertModel, InferSelectModel, SQL, sql } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { companies } from "~/drizzle/schema";

export async function findAll(filters?: { limit?: number, offset?: number }) {
    return await db.query.companies.findMany({
        orderBy: {
            name: "asc",
            companyId: "asc"
        },
        ...filters
    })
}

export async function findById(companyId: number) {
    return await db.query.companies.findFirst({
        where: {
            companyId
        },
    })
}

export async function editDeveloper(companyId: number, data: Partial<InferSelectModel<typeof companies>>) {

    return db.update(companies)
    .set({
        ...data,
        dateModified: sql`NOW()`
    })
    .where(eq(companies.companyId, companyId)).returning({
        oldLogo: sql.raw(`OLD.${companies.logo.name}`) as SQL<string>,
        ...getColumns(companies)
    })
}

export async function createDeveloper(data: InferInsertModel<typeof companies>) {
    const result = await db.insert(companies).values(data).returning()
    return result[0]
}