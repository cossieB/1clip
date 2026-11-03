import { StartRequestEvent } from "@solidjs/vite-plugin";
import { auth } from "~/features/auth/authConfig";

export async function authenticate(event: StartRequestEvent, next: () => Promise<Response>) {
    const headers = event.request.headers;
    const session = await auth.api.getSession({
        headers
    })    
    event.locals.session = session
    return next()
}