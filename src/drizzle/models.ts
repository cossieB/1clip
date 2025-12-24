import type { InferSelectModel, InferSelectViewModel } from "drizzle-orm";
import { users } from "./schema/auth";
import { games, developers, publishers, actors, platforms } from "./schema/schema";
import { gamesView, developersView, publishersView, actorsView, platformsView } from "./schema/views";

export type Game = InferSelectModel<typeof games>
export type Developer = InferSelectModel<typeof developers>
export type Publisher = InferSelectModel<typeof publishers>
export type Actor = InferSelectModel<typeof actors>
export type Platform = InferSelectModel<typeof platforms>
export type User = InferSelectModel<typeof users>

export type GameView = InferSelectViewModel<typeof gamesView>
export type DeveloperView = InferSelectViewModel<typeof developersView>
export type PublisherView = InferSelectViewModel<typeof publishersView>
export type ActorView = InferSelectViewModel<typeof actorsView>
export type PlatformView = InferSelectViewModel<typeof platformsView>