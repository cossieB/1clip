import type { InferSelectModel, InferSelectViewModel } from "drizzle-orm";
import { users } from "./schema/auth";
import { games, developers, publishers, actors, platforms, posts, notifications, appearances } from "./schema/schema";

export type Game = InferSelectModel<typeof games>
export type Developer = InferSelectModel<typeof developers>
export type Publisher = InferSelectModel<typeof publishers>
export type Actor = InferSelectModel<typeof actors>
export type Platform = InferSelectModel<typeof platforms>
export type User = InferSelectModel<typeof users>
export type Post = InferSelectModel<typeof posts>
export type Notification = InferSelectModel<typeof notifications>
export type Appearances = InferSelectModel<typeof appearances>

export type RoleType = "player character" | "major character" | "minor character"