import { sql } from "drizzle-orm";
import { timestamp, integer, pgTable, text, varchar, primaryKey, pgEnum, jsonb, check, uuid, foreignKey, date, unique, customType, index, boolean } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
    companyId: integer("company_id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name").notNull(),
    logo: text("logo").notNull(),
    headquarters: varchar("headquarters"),
    summary: text("summary").notNull().default(""),
    country: varchar("country"),
    dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
    dateModified: timestamp("date_modified", { withTimezone: true }),
})

export const games = pgTable("games", {
    gameId: integer("game_id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title").notNull(),
    summary: text("summary").notNull().default(""),
    developerId: integer("developer_id").notNull().references(() => companies.companyId),
    publisherId: integer("publisher_id").notNull().references(() => companies.companyId),
    releaseDate: date("release_date").notNull(),
    cover: text("cover").notNull(),
    banner: text("banner").notNull(),
    trailer: text("trailer"),
    dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
    dateModified: timestamp("date_modified", { withTimezone: true }),
    searchVector: customType({ dataType: () => 'tsvector' })("search_vector").generatedAlwaysAs(sql`(setweight(to_tsvector('english'::regconfig, (COALESCE(title, ''::character varying))::text), 'A'::"char") || setweight(to_tsvector('english'::regconfig, COALESCE(summary, ''::text)), 'B'::"char"))`)
}, table => [
    index().using("gin", table.searchVector),
    index().on(table.developerId),
    index().on(table.publisherId)
]);

export const platforms = pgTable("platforms", {
    platformId: integer("platform_id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name").notNull(),
    logo: text("logo").notNull(),
    releaseDate: date("release_date").notNull(),
    summary: text("summary").notNull().default(""),
    dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
    dateModified: timestamp("date_modified", { withTimezone: true }),
});

export const actors = pgTable("actors", {
    actorId: integer("actor_id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name").notNull(),
    photo: text("photo"),
    bio: text("bio").notNull().default(""),
    dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
    dateModified: timestamp("date_modified", { withTimezone: true }),
});

export const genres = pgTable("genres", {
    name: varchar("name").primaryKey(),
    description: text("description").notNull().default(""),
    dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
    dateModified: timestamp("date_modified", { withTimezone: true })
});

export const roleType = pgEnum('role_type', ["player character", "major character", "minor character"])

export const appearances = pgTable("appearances", {
    appearanceId: integer("appearance_id").primaryKey().generatedAlwaysAsIdentity(),
    gameId: integer("game_id").notNull().references(() => games.gameId, { onDelete: "cascade" }),
    actorId: integer("actor_id").notNull().references(() => actors.actorId, { onDelete: "cascade" }),
    character: varchar().notNull(),
    roleType: roleType("role_type").notNull().default("major character")
}, (table) => [
    unique().on(table.gameId, table.actorId)
]);

export const gamePlatforms = pgTable("game_platforms", {
    gameId: integer("game_id").notNull().references(() => games.gameId, { onDelete: "cascade" }),
    platformId: integer("platform_id").notNull().references(() => platforms.platformId, { onDelete: "cascade" }),
}, (table) => [
    primaryKey({ columns: [table.gameId, table.platformId] })
]);

export const gameGenres = pgTable("game_genres", {
    gameId: integer("game_id").notNull().references(() => games.gameId, { onDelete: "cascade" }),
    genre: varchar("genre").notNull().references(() => genres.name, { onDelete: "cascade", onUpdate: "cascade" }),
}, (table) => [
    primaryKey({ columns: [table.gameId, table.genre] })
]);