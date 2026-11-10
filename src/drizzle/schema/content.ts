import { sql } from "drizzle-orm";
import { timestamp, integer, pgTable, text, varchar, primaryKey, pgEnum, jsonb, check, uuid, foreignKey, date, unique, customType, index, boolean } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { games } from "./info";

export const posts = pgTable('posts', {
    postId: integer("post_id").primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: varchar("title", { length: 20 }).notNull(),
    gameId: integer("game_id").references(() => games.gameId, { onDelete: "set null" }),
    text: varchar("text", { length: 1000 }).notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    editedOn: timestamp("edited_on", { withTimezone: true }),
    views: integer("views").notNull().default(0),
    link: text("link"),
    pending: boolean().notNull().default(false),
    searchVector: customType({ dataType: () => 'tsvector' })('search_vector').generatedAlwaysAs(sql`(setweight(to_tsvector('english'::regconfig, (COALESCE(title, ''::character varying))::text), 'A'::"char") || setweight(to_tsvector('english'::regconfig, (COALESCE(text, ''::character varying))::text), 'B'::"char"))`),
}, table => [
    index().using("gin", table.searchVector),
    index().on(table.createdAt)
])

export const squads = pgTable("squads", {
    squadId: integer("squad_id").primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    text: varchar("text", { length: 255 }).notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    editedOn: timestamp("edited_on", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    gameId: integer("game_id").references(() => games.gameId, { onDelete: "set null" }),
    /** excluding owner */
    slots: integer("slots").notNull(),
}, table => [
    index().on(table.gameId),
    index().on(table.createdAt)
])

export const status = pgEnum("status", ["pending", "accepted", "rejected"])

export const squadApplications = pgTable("squad_applications", {
    applicationId: integer("application_id").primaryKey().generatedAlwaysAsIdentity(),
    squadId: integer("squad_id").notNull().references(() => squads.squadId, { onDelete: "cascade" }),
    message: varchar("message"),
    candidateId: uuid("candidate_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: status("status").notNull().default("pending"),
    appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow()
}, t => [
    unique().on(t.squadId, t.candidateId)
])

export const comments = pgTable("comments", {
    commentId: integer("comment_id").primaryKey().generatedAlwaysAsIdentity(),
    postId: integer("post_id").notNull().references(() => posts.postId, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    text: varchar("text", { length: 255 }).notNull(),
    replyTo: integer("reply_to"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    editedOn: timestamp("edited_on", { withTimezone: true })
}, t => [
    check("comment_min_length", sql`LENGTH(${t.text}) > 0`),
    foreignKey({
        columns: [t.replyTo],
        foreignColumns: [t.commentId],
    }).onDelete("cascade"),
    index().on(t.postId)
])

export const postLikes = pgTable("post_likes", {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    postId: integer("post_id").notNull().references(() => posts.postId, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
}, t => [
    primaryKey({ columns: [t.postId, t.userId] })
])

export const commentLikes = pgTable("comment_likes", {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    commentId: integer("comment_id").notNull().references(() => comments.commentId, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
}, t => [
    primaryKey({ columns: [t.commentId, t.userId] })
])

export const media = pgTable("media", {
    key: text("key").primaryKey(),
    contentType: varchar("content_type").notNull(),
    postId: integer("post_id").references(() => posts.postId, { onDelete: "set null" }),
    gameId: integer("game_id").references(() => games.gameId, { onDelete: "set null" }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, table => [
    index().on(table.postId),
    index().on(table.gameId)
])

export const postTags = pgTable("post_tags", {
    tagName: varchar("tag_name", { length: 25 }).notNull(),
    postId: integer("post_id").notNull().references(() => posts.postId, { onDelete: "cascade" }),
}, table => [
    primaryKey({ columns: [table.tagName, table.postId] })
])

export const followerFollowee = pgTable('follower_followee', {
    followerId: uuid("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    followeeId: uuid("followee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    dateFollowed: timestamp('date_followed', { withTimezone: true }).notNull().defaultNow(),
}, table => [
    primaryKey({ columns: [table.followerId, table.followeeId] })
])

export const notifications = pgTable("notifications", {
    notificationId: integer("notification_id").primaryKey().generatedAlwaysAsIdentity(),
    recipientId: uuid("recipient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    sourceUserId: uuid("source_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    readAt: timestamp('read_at', { withTimezone: true }),
    actionUrl: text("action_url"),
    type: varchar("type", { length: 30 }).$type<"LIKE" | "REPLY" | "MENTION" | "FOLLOW" | "SYSTEM">(),
    title: text(),
    message: text(),
    entityType: varchar("entity_type", { length: 50 }),
    entityId: integer("entity_id")
}, table => [
    index().on(table.recipientId)
])
