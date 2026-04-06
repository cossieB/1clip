export type NotifMessage = {
    message: string
    type: "LIKE" | "REPLY" | "FOLLOW",
    postId: string
    date: Date
}

export interface NotificationService {
    setup(userId: string): Promise<void>;
    close(): void
    addNotification(userId: string, data: NotifMessage): Promise<void>
    listenForNotifications(userId: string): AsyncGenerator<{
        id: string;
        message: Record<string, string>;
    }, void, unknown>

}