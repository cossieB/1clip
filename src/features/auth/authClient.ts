import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/client";
import { auth } from "./authConfig";

export const authClient = createAuthClient({
    plugins: [
        usernameClient(),
        inferAdditionalFields<typeof auth>()
    ]
})

export type Session = typeof authClient.$Infer.Session
export type AuthUser = typeof authClient.$Infer.Session.user