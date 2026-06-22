import { createMiddleware } from "@solidjs/start/middleware";
import { authenticate } from "./authenticate";
import { secureHeaders } from "./secureHeaders";
import { csrfMiddleware } from "./csrf";

export default createMiddleware({
    onRequest: [csrfMiddleware, secureHeaders, authenticate],
    
})