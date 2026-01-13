import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { actors } from "~/drizzle/schema";

export function findById(actorId: number) {
    return db.query.actors.findFirst({
        where: {
            actorId
        }
    })
}

export async function findAll() {
    return db.query.actors.findMany()
}

export function createActor(actor: InferInsertModel<typeof actors>) {
    return db.insert(actors).values(actor).returning()
}

export function editActor(actorId: number, actor: Partial<InferSelectModel<typeof actors>>) {
    return db.update(actors).set(actor).where(eq(actors.actorId, actorId))
}