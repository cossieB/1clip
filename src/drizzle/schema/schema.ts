import { sql } from "drizzle-orm";
import { timestamp, integer, pgTable, text, varchar, primaryKey, pgEnum, jsonb, check, uuid, foreignKey, date } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const developers = pgTable("developers", {
    developerId: integer("developer_id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name").notNull(),
    logo: text("logo").notNull(),
    location: varchar("location"),
    summary: text("summary").notNull().default(""),
    country: varchar("country"),
    dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
    dateModified: timestamp("date_modified", { withTimezone: true }),
})

export const publishers = pgTable("publishers", {
    publisherId: integer("publisher_id").primaryKey().generatedAlwaysAsIdentity(),
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
    developerId: integer("developer_id").notNull().references(() => developers.developerId),
    publisherId: integer("publisher_id").notNull().references(() => publishers.publisherId),
    releaseDate: date("release_date").notNull(),
    cover: text("cover").notNull(),
    banner: text("banner").notNull(),
    trailer: text("trailer"),
    dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
    dateModified: timestamp("date_modified", { withTimezone: true }),
});

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
    dateModified: timestamp("date_modified", { withTimezone: true }).notNull().$onUpdateFn(() => new Date()),
});

export const genres = pgTable("genres", {
    name: varchar("name").primaryKey(),
    description: text("description").notNull().default(""),
    dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
    dateModified: timestamp("date_modified", { withTimezone: true }).notNull().$onUpdateFn(() => new Date())
});

export const roleType = pgEnum('role_type', ["player character", "major character", "minor character"])

export const gameActors = pgTable("game_actors", {
    gameId: integer("game_id").notNull().references(() => games.gameId, { onDelete: "cascade" }),
    actorId: integer("actor_id").notNull().references(() => actors.actorId, { onDelete: "cascade" }),
    character: varchar().notNull(),
    roleType: roleType("role_type").notNull().default("major character")
}, (table) => [
    primaryKey({ columns: [table.gameId, table.actorId] })
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

export const posts = pgTable('posts', {
    postId: integer("post_id").primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: varchar("title", { length: 20 }).notNull(),
    gameId: integer("game_id").references(() => games.gameId, { onDelete: "set null" }),
    text: varchar("text", { length: 1000 }).notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    editedOn: timestamp("edited_on", { withTimezone: true }).notNull().$onUpdateFn(() => new Date())
})

export const comments = pgTable("comments", {
    commentId: integer("comment_id").primaryKey().generatedAlwaysAsIdentity(),
    postId: integer("post_id").primaryKey().references(() => posts.postId, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    text: varchar("text", { length: 255 }).notNull(),
    replyTo: integer("reply_to"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    editedOn: timestamp("edited_on", { withTimezone: true }).notNull().$onUpdateFn(() => new Date())
}, t => [
    check("comment_min_length", sql`LENGTH(${t.text}) > 0`),
    foreignKey({
        columns: [t.replyTo],
        foreignColumns: [t.commentId],
    }).onDelete("cascade")
])

export const reactionType = pgEnum("reaction_type", ["like", "dislike"])

export const postReactions = pgTable("post_reactions", {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    postId: integer("post_id").references(() => posts.postId, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
    reaction: reactionType("reaction").notNull()
}, t => [
    primaryKey({ columns: [t.postId, t.userId] })
])

export const commentReactions = pgTable("comment_reactions", {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    commentId: integer("comment_id").notNull().references(() => comments.commentId, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
    reaction: reactionType("reaction").notNull()
}, t => [
    primaryKey({ columns: [t.commentId, t.userId] })
])

export const media = pgTable("media", {
    key: text("key").primaryKey(),
    contentType: varchar("content_type").notNull(),
    postId: integer("post_id").references(() => posts.postId, { onDelete: "set null" }),
    gameId: integer("game_id").references(() => games.gameId, { onDelete: "set null" }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow()
})

export const postTags = pgTable("post_tags", {
    tagName: varchar("tag_name", { length: 25 }).notNull().primaryKey(),
    postId: integer("post_id").references(() => posts.postId, { onDelete: "cascade" }),
}, table => [
    primaryKey({ columns: [table.tagName, table.postId] })
])