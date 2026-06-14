import { createStart, createMiddleware, createCsrfMiddleware } from "@tanstack/solid-start";
import { getResponseHeaders, setResponseHeader, setResponseHeaders } from "@tanstack/solid-start/server";
import { randomBytes } from "node:crypto";

const csrfMiddleware = createCsrfMiddleware({
    filter: (ctx) => ctx.handlerType === 'serverFn',
})

const secureHeadersMiddleware = createMiddleware().server(async ({ next }) => {
    const nonce = randomBytes(16).toString("base64");
    const csp = [
        "frame-ancestors 'none'",
        "default-src 'self'",
        "img-src 'self' https://r2.cossie.dev blob: ",
        "media-src 'self' https://r2.cossie.dev blob: ",
        "connect-src 'self' https://r2.cossie.dev",
        "object-src 'none'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' unsafe-eval`,
        `style-src 'self' https://fonts.googleapis.com 'unsafe-inline'`,
        `frame-src 'self' https://www.youtube.com https://*.twitch.tv https://youtube-nocookie.com`, 
        "font-src 'self' https://fonts.gstatic.com",
        `base-uri 'none'`,
        "form-action 'self'",
        "upgrade-insecure-requests"
    ]

    const headers = {
        "Content-Security-Policy": csp.join("; ") + ";",
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=31536000;',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    }
    
    const result = await next({
        context: {
            nonce
        }
    })
    
    for (const [key, val] of Object.entries(headers)) 
        result.response.headers.set(key, val)

    return result
})

export const startInstance = createStart(() => {
    return {
        requestMiddleware: [secureHeadersMiddleware, csrfMiddleware]
    }
})