import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "~/drizzle/db";
import { redis } from "./redis";

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
                type: "string",
                input: false,
                required: true,
                defaultValue: "user"
            },
            banner: {
                type: "string",
                input: true,
                required: false,
            }
        },

    },
    emailAndPassword: {
        enabled: true
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url, token }) => {
            console.log(url, "\n", token)
        },
        autoSignInAfterVerification: true,
    },
    plugins: [username({
        minUsernameLength: 3,
        maxUsernameLength: 15,
        usernameValidator(username) {
            return /^[a-zA-Z]\w{2,14}$/.test(username)
        },
    })],
    advanced: {
        database: {
            generateId: "uuid"
        }
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const u = await db.query.users.findFirst({
                        columns: {
                            id: true
                        },
                        where: {
                            username: user.username!
                        }
                    })
                    if (u) throw new APIError("BAD_REQUEST", { message: "Username is taken" })
                    return true
                },
            }
        }
    },
    secondaryStorage: {
        set(key, value, ttl) {
            if (ttl)
                redis.setEx(key, ttl, value)
            else
                redis.set(key, value)
        },
        delete(key) {
            redis.del(key)
        },
        get(key) {
            return redis.get(key)
        },
    }
});

