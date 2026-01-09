import {defineConfig} from 'drizzle-kit';

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/drizzle/schema/*.ts",
    out: "./src/drizzle/migrations",
    dbCredentials: {
        url: "postgres://postgres:password@localhost:5432/gg"
    }
})