/// <reference types="@solidjs/start/env" />

import { type getCurrentUser } from "./services/authService";

declare global {
    namespace App {
        interface RequestEventLocals {
            user: Awaited<ReturnType<typeof getCurrentUser>>
        }
    }
}