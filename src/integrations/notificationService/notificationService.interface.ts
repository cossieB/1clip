import { UserNotification } from "~/features/notifications/utils/NotificationsSchema";

export interface NotificationService {
    setup(userId: string): Promise<void>;
    close(): void
    addNotification(userId: string, data: UserNotification): Promise<void>
    listenForNotifications(userId: string): AsyncGenerator<{
        id: string;
        message: Record<string, string>;
    }, void, unknown>

}