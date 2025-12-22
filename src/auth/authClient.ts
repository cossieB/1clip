import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/solid";
import { auth } from "./server";

export const authClient = createAuthClient({
    plugins: [
        usernameClient(),
        inferAdditionalFields<typeof auth>()
    ]
})

export type Session = typeof authClient.$Infer.Session