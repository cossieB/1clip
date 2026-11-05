import { RedisService } from "./RedisService.server";
import 'server-only'

export const cacheService = new RedisService()