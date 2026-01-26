import { sql } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    boolean,
    uuid,
    index,
    varchar,
    date,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id")
        .default(sql`uuidv7()`)
        .primaryKey(),
    displayName: varchar("display_name", { length: 15 }).notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image").notNull().default("users/default_avatar.png"),
    banner: text("banner").notNull().default("users/default_banner.jpg"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    username: varchar("username", { length: 15 }).notNull().unique(),
    displayUsername: varchar("display_username", { length: 15 }).notNull().unique(),
    role: varchar("role", { length: 10 }).default("user").notNull(),
    bio: varchar("bio", {length: 255}).notNull().default(""),
    dob: date('dob'),
    location: varchar("location", {length: 100}),
    links: text('links').array().notNull().default([])
});

export const sessions = pgTable(
    "sessions",
    {
        id: uuid("id")
            .default(sql`uuidv7()`)
            .primaryKey(),
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: varchar("ip_address"),
        userAgent: text("user_agent"),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
    },
    (table) => [index("sessions_userId_idx").on(table.userId)],
);

export const accounts = pgTable(
    "accounts",
    {
        id: uuid("id")
            .default(sql`uuidv7()`)
            .primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("accounts_userId_idx").on(table.userId)],
);

export const verifications = pgTable(
    "verifications",
    {
        id: uuid("id")
            .default(sql`uuidv7()`)
            .primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("verifications_identifier_idx").on(table.identifier)],
);
