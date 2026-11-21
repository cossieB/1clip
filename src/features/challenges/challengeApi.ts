import { GET } from "@solidjs/web/server-functions";
import { ensureAuthed } from "../auth/utils/ensureAuth";
import { getTodaysChallengeProgress } from "./challengesRepository";
import { respond } from "@solidjs/web";

export const getTodaysChallengeProgressFn = GET(async () => {
    'use server'
    const userSession = await ensureAuthed();
    const result = await getTodaysChallengeProgress(userSession.user.id);
    return respond(result, {
        headers: {
            "Cache-Control": "private, max-age=300"
        }
    })
})