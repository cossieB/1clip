import { RedisNotificationService } from "./RedisNotificationService.server";
import 'server-only'

export const notificationsService = new RedisNotificationService()