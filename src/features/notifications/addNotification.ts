import { eq, inArray, InferInsertModel } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { notifications, users } from "~/drizzle/schema";
import * as notificationsRepository from "./notificationsRepository"
import { notificationsService } from "~/integrations/notificationService";

type Notification = {
    createdAt?: Date | undefined;
    sourceUserId?: string | null | undefined;
    readAt?: Date | null | undefined;
    actionUrl?: string | null | undefined;
    type?: "LIKE" | "REPLY" | "MENTION" | "FOLLOW" | "SYSTEM" | null | undefined;
    title?: string | null | undefined;
    message?: string | null | undefined;
    entityType?: string | null | undefined;
    entityId?: number | null | undefined;
};

type Recipient =
    | { username: string; }
    | { userId: string; };

export async function addNotification(recipients: Recipient[], notification: Notification) {
    if (!recipients.length) return [];

    const directUserIds = new Set<string>();
    const usernamesToFetch = new Set<string>();

    for (const recipient of recipients) {
        if ("userId" in recipient && recipient.userId) {
            directUserIds.add(recipient.userId);
        }
        else if ("username" in recipient && recipient.username) {
            usernamesToFetch.add(recipient.username);
        }
    }

    let fetchedUserIds: string[] = [];
    if (usernamesToFetch.size > 0) {
        const foundUsers = await db
            .select({ id: users.id })
            .from(users)
            .where(inArray(users.username, Array.from(usernamesToFetch)));

        fetchedUserIds = foundUsers.map((u) => u.id);
    }
    const targetRecipientIds = Array.from(new Set([...directUserIds, ...fetchedUserIds]));
    if (!targetRecipientIds.length) return [];

    const recordsToInsert = targetRecipientIds.map((recipientId) => ({
        recipientId,
        sourceUserId: notification.sourceUserId,
        createdAt: notification.createdAt,
        readAt: notification.readAt,
        actionUrl: notification.actionUrl,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        entityType: notification.entityType,
        entityId: notification.entityId,
    }));
    const inserted = await notificationsRepository.createNotification(recordsToInsert)

    for (const ins of inserted) {
        void notificationsService.publish(ins.recipientId)
    }
}