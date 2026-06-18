'use server'

import { NotificationService } from "./notificationService.interface";
import { RedisNotificationService } from "./RedisNotificationService";

// export const notificationsService = new RedisNotificationService()

export const notificationsService: NotificationService = {
    async addNotification(userId, data) {
        
    },
    close() {
        
    },
    async *listenForNotifications(userId) {
        
    },
    async setup(userId) {
        
    },
}