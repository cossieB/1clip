import { getRequestEvent } from "@solidjs/web"
import { auth } from "./authConfig"
import { OnlineUsersService } from "~/services/onlineUsersService"

export async function getCurrentUser() {
    'use server'
    const headers = getRequestEvent()!.request.headers
    const userSession = await auth.api.getSession({
        headers
    })
    void OnlineUsersService.initializeUser(userSession?.user ?? {
        id: getRequestEvent()?.request.headers.get("CF-Connecting-IP") ?? "127.0.0.1",
        displayUsername: "Anon",
        image: "users/anon.webp"
    })
    
    return userSession
}