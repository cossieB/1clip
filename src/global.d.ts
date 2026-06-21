/// <reference types="@solidjs/start/env" />

import { type getCurrentUser } from "./services/authService";
import { CustomSession } from "./utils/types";

declare global {
    namespace App {
        interface RequestEventLocals {
            user: CustomSession | null
        }
    }
}