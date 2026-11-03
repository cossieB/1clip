import type { InferSelectModel, InferEnum } from "drizzle-orm";
import { users } from "./schema/auth";
import { games, companies, actors, platforms, posts, notifications, appearances, roleType } from "./schema";

export type Game = InferSelectModel<typeof games>
export type Company = InferSelectModel<typeof companies>
export type Actor = InferSelectModel<typeof actors>
export type Platform = InferSelectModel<typeof platforms>
export type User = InferSelectModel<typeof users>
export type Post = InferSelectModel<typeof posts>
export type Notification = InferSelectModel<typeof notifications>
export type Appearances = InferSelectModel<typeof appearances>
export type RoleType = InferEnum<typeof roleType>