import { getRequestEvent } from "@solidjs/web"
import { auth } from "./authConfig"

export async function getCurrentUser() {
    'use server'
    const headers = getRequestEvent()!.request.headers
    return await auth.api.getSession({
        headers
    })
}