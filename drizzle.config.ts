import {defineConfig} from 'drizzle-kit';

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/drizzle/schema/index.ts",
    out: "./src/drizzle/migrations",
    dbCredentials: {
        url: process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/gg"
    }
})