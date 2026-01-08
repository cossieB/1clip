import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { actors } from "~/drizzle/schema";

export function findById(actorId: number) {
    return db.query.actors.findFirst({
        columns: {
            dateAdded: false,
            dateModified: false
        },
        where: {
            actorId
        }
    })
}

export function createActor(actor: InferInsertModel<typeof actors>) {
    return db.insert(actors).values(actor).returning()
}

export function editActor(actorId: number, actor: Partial<InferSelectModel<typeof actors>>) {
    return db.update(actors).set(actor).where(eq(actors.actorId, actorId))
}