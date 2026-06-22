import { type FetchEvent } from "@solidjs/start/server";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS", "TRACE"];

export function csrfMiddleware(event: FetchEvent) {
    
    if (SAFE_METHODS.includes(event.request.method)) return;

    const requestHeaders = event.request.headers;
    const origin = requestHeaders.get("Origin");
    const referer = requestHeaders.get("Referer");

    const host = requestHeaders.get("X-Forwarded-Host") || requestHeaders.get("Host");

    let sourceHost: string | null = null;

    try {
        if (origin) {
            sourceHost = new URL(origin).host;
        } 
        else if (referer) {
            sourceHost = new URL(referer).host;
        }
    }
    catch {
        return new Response("Invalid Origin or Referer header structure", { status: 400 });
    }

    if (!sourceHost) {
        return new Response("CSRF verification failed: Missing source origin", { status: 403 });
    }

    if (!host || sourceHost !== host) {
        return new Response("CSRF verification failed: Origin mismatch", { status: 403 });
    }
}