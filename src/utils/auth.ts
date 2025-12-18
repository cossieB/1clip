import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "~/drizzle/db";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
    }),
    user: {
        fields: {
            name: "displayName"
        },
        additionalFields: {
            role: {
                fieldName: "role",
                type: "string",
                input: false,       
                required: true,
                defaultValue: "user"     
            }
        }
    },
    emailAndPassword: {
        enabled: true
    },
    plugins: [username({
        minUsernameLength: 3,
        maxUsernameLength: 15,
    })],
    advanced: {
        database: {
            generateId: "uuid"
        }
    }
});

