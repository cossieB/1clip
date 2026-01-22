import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "~/drizzle/db";
import { emailService } from "~/integrations/emailService";
import { redis } from "~/utils/redis";
import { waitUntil } from "@vercel/functions";

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
        changeEmail: {
            enabled: true,
            updateEmailWithoutVerification: true,
            sendChangeEmailConfirmation: async ({ newEmail, url, token }) => {
                waitUntil(emailService.sendMail({
                    to: newEmail,
                    subject: "Verify your email address",
                    text: `Click the link to verify your email: ${url}`,
                }))
            },
        },
        deleteUser: {
            enabled: true,
            sendDeleteAccountVerification: async ({url, user}) => {
                waitUntil(emailService.sendMail({
                    to: user.email,
                    subject: "Confirm account deletion",
                    text: `Click the link to confirm that you want to delete your account: ${url}`
                }))
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async (data, request) => {
            waitUntil(emailService.sendMail({
                to: data.user.email,
                subject: "Reset your password",
                text: `Click the link to reset your password: ${data.url}`
            }))
        },        
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url, token }) => {
            waitUntil(emailService.sendMail({
                to: user.email,
                subject: "Verify your email address",
                text: `Click the link to verify your email: ${url}`,
            }))
        },
        autoSignInAfterVerification: true,
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 600
        }
    },
    plugins: [username({
        minUsernameLength: 3,
        maxUsernameLength: 15,
        usernameValidator(username) {
            return /^[a-zA-Z]\w{2,14}$/.test(username)
        },        
    })],
    advanced: {
        cookiePrefix: "spectre",
        database: {
            generateId: "uuid"
        },
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
            },
        }
    },
    secondaryStorage: {
        async set(key, value, ttl) {
            if (ttl)
                await redis.setEx(key, ttl, value)
            else
                await redis.set(key, value)
        },
        async delete(key) {
            await redis.del(key)
        },
        get(key) {
            return redis.get(key)
        },
    },
    rateLimit: {
        enabled: true,
        customRules: {
            "/send-verification-email": {
                window: 60,
                max: 1
            }
        }
    },
});

