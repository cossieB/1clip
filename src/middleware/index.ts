import { createMiddleware } from "@solidjs/start/middleware";
import { getCurrentUser } from "~/services/authService";

export default createMiddleware({
    onBeforeResponse: async (event) => {
        const user = await getCurrentUser();
        event.locals.user = user
    }
})