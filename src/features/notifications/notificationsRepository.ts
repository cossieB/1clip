import { and, eq, inArray, InferInsertModel } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { notifications } from "~/drizzle/schema";
import { sql, gt } from "drizzle-orm";

export async function createNotification(notification: InferInsertModel<typeof notifications> | InferInsertModel<typeof notifications>[]) {
    // @ts-expect-error
    return await db.insert(notifications).values(notification).returning();
}

export function getNotifications(filter: { userId: string }) {
    return db.query.notifications.findMany({
        where: {
            recipientId: filter.userId
        },
        orderBy: {
            notificationId: "desc"
        }
    })
}

export function updateNotification(notificationId: number, notification: Partial<InferInsertModel<typeof notifications>>) {
    return db.update(notifications)
        .set(notification)
        .where(eq(notifications.notificationId, notificationId))
        .returning()
}

export function markAsRead(ids: number[], userId: string) {
    return db.update(notifications).set({readAt: new Date}).where(and(
        inArray(notifications.notificationId, ids),
        eq(notifications.recipientId, userId)
    ))
}

export async function truncateUserNotifications() {
    const rankedSq = db
        .$with("ranked_notifications")
        .as(
            db.select({
                notificationId: notifications.notificationId,
                rowNum: sql<number>`ROW_NUMBER() OVER (
                    PARTITION BY ${notifications.recipientId} 
                    ORDER BY ${notifications.createdAt} DESC, ${notifications.notificationId} DESC
                )`.as("row_num"),
            })
                .from(notifications)
        );

    await db
        .with(rankedSq)
        .delete(notifications)
        .where(
            sql`${notifications.notificationId} IN (
                SELECT ${rankedSq.notificationId} 
                FROM ${rankedSq} 
                WHERE ${rankedSq.rowNum} > 20
            ) OR ${notifications.createdAt} < NOW() - INTERVAL '30 days'`
        );
}
