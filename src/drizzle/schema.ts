import { getColumns } from "drizzle-orm";
import { timestamp, integer, pgTable, text, varchar, primaryKey, pgEnum, pgView } from "drizzle-orm/pg-core";

export const developers = pgTable("developers", {
    developerId: integer("developer_id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name").notNull(),
    logo: text("logo"),
    location: varchar("location"),
    summary: text("summary").notNull().default(""),
    country: varchar("country"),
    dateAdded: timestamp("date_added", {mode: "string", withTimezone: true}).notNull().defaultNow(),
    dateModified: timestamp("date_modified", {mode: "string", withTimezone: true}),
})

export const publishers = pgTable("publishers", {
    publisherId: integer("publisher_id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name").notNull(),
    logo: text("logo"),
    headquarters: varchar("headquarters"),
    summary: text("summary").notNull().default(""),
    country: varchar("country"),
    dateAdded: timestamp("date_added", {mode: "string", withTimezone: true}).notNull().defaultNow(),
    dateModified: timestamp("date_modified", {mode: "string", withTimezone: true}),
})

export const games = pgTable("games", {
    gameId: integer("game_id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title").notNull(),
    summary: text("summary").notNull().default(""),
    developerId: integer("developer_id").notNull().references(() => developers.developerId),
    publisherId: integer("publisher_id").notNull().references(() => publishers.publisherId),
    releaseDate: timestamp("release_date", {mode: "date", withTimezone: true}).notNull(),
    cover: text("cover").notNull(),
    banner: text("banner").notNull(),
    trailer: text("trailer"),
    dateAdded: timestamp("date_added", {mode: "string", withTimezone: true}).notNull().defaultNow(),
    dateModified: timestamp("date_modified", {mode: "string", withTimezone: true}),
});

export const platforms = pgTable("platforms", {
    platformId: integer("platform_id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name").notNull(),
    logo: text("logo"),
    releaseDate: timestamp("release_date", {mode: "string", withTimezone: true}),
    summary: text("summary").notNull().default(""),
    dateAdded: timestamp("date_added", {mode: "string", withTimezone: true}).notNull().defaultNow(),
    dateModified: timestamp("date_modified", {mode: "string", withTimezone: true}),
});

export const actors = pgTable("actors", {
    actorId: integer("actor_id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name").notNull(),
    photo: text("photo"),
    bio: text("bio").notNull().default(""),
    dateAdded: timestamp("date_added", {mode: "string", withTimezone: true}).notNull().defaultNow(),
    dateModified: timestamp("date_modified", {mode: "string", withTimezone: true}),
});

export const tags = pgTable("tags", {
    name: varchar("name").primaryKey(),
    description: text("description").notNull().default(""),
    dateAdded: timestamp("date_added", {mode: "string", withTimezone: true}).notNull().defaultNow(),
    dateModified: timestamp("date_modified", {mode: "string", withTimezone: true}),
});

export const roleType = pgEnum('role_type', ["player character", "major character", "minor character"])

export const gameActors = pgTable("game_actors", {
    gameId: integer("game_id").notNull().references(() => games.gameId),
    actorId: integer("actor_id").notNull().references(() => actors.actorId),
    character: varchar().notNull(),
    roleType: roleType("role_type").notNull().default("major character")
}, (table) => [
    primaryKey({columns: [table.gameId, table.actorId]})
]);

export const gamePlatforms = pgTable("game_platforms", {
    gameId: integer("game_id").notNull().references(() => games.gameId),
    platformId: integer("platform_id").notNull().references(() => platforms.platformId),
}, (table) => [
    primaryKey({columns: [table.gameId, table.platformId]})
]);

export const gameTags = pgTable("game_tags", {
    gameId: integer("game_id").notNull().references(() => games.gameId),
    tagName: varchar("tag_name").notNull().references(() => tags.name), 
}, (table) => [
    primaryKey({columns: [table.gameId, table.tagName]})
]);

export const gamesView = pgView("games_view").as(qb => {
    const { dateAdded, dateModified, ...rest } = getColumns(games)
    return qb.select({...rest}).from(games)
})

export const developersView = pgView("developers_view").as(qb => {
    const { dateAdded, dateModified, ...rest } = getColumns(developers)
    return qb.select({...rest}).from(developers)
})


export const publishersView = pgView("publishers_view").as(qb => {
    const { dateAdded, dateModified, ...rest } = getColumns(publishers)
    return qb.select({...rest}).from(publishers)
})

export const platformsView = pgView("platforms_view").as(qb => {
    const { dateAdded, dateModified, ...rest } = getColumns(platforms)
    return qb.select({...rest}).from(platforms)
})

export const actorsView = pgView("actors_view").as(qb => {
    const { dateAdded, dateModified, ...rest } = getColumns(actors)
    return qb.select({...rest}).from(actors)
})
