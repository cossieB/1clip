import { setResponseHeaders } from "@solidjs/start/http";
import { type FetchEvent } from "@solidjs/start/server";
import { randomBytes } from "crypto";

export async function secureHeaders(event: FetchEvent) {
    const nonce = randomBytes(16).toString("base64");
    event.locals.nonce = nonce
    const csp = [
        "frame-ancestors 'none'",
        "default-src 'self'",
        "img-src 'self' https://r2.cossie.dev blob: ",
        "media-src 'self' https://r2.cossie.dev blob: ",
        "connect-src 'self' https://r2.cossie.dev",
        "object-src 'none'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`,
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
    setResponseHeaders(headers)
}