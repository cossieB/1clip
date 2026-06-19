import { createMiddleware } from "@solidjs/start/middleware";
import { authenticate } from "./authenticate";

export default createMiddleware({
    onRequest: [authenticate],
})