import { query, redirect } from "@solidjs/router";
import { getRequestHeaders } from "@solidjs/start/http"
import { auth } from "~/auth/server";
import * as userRepository from "~/repositories/userRepository"
import { CustomSession } from "~/utils/types";

export async function checkSession() {
    'use server'
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({
        headers
    })
    if (session) throw redirect("/settings/profile")
}

export async function getProfile() {
    'use server'
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({
        headers
    })
    if (!session) throw redirect("/auth/signin")
    const user = await userRepository.findById(session.user.id);
    if (!user) {
        return forceLogin()
    }
    return user
}

export async function getCurrentUser() {
    'use server'
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({
        headers
    })
    if (!session) return null
    return session.user as CustomSession
}

export async function revokeSession() {
    'use server'
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({
        headers
    })
    if (session)
        await auth.api.revokeSession({
            headers,
            body: {
                token: session.session.token
            }
        })
}

export async function forceLogin(): Promise<never> {
    'use server'
    await revokeSession();
    throw redirect("/auth/signin")
}

export const getActiveSession = query(getCurrentUser, "session")