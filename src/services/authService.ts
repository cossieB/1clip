'use server'

import { redirect } from "@solidjs/router";
import { getRequestHeaders } from "@solidjs/start/http"
import { auth } from "~/auth/server";
import * as userRepository from "~/repositories/userRepository"

export async function checkSession() {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({
        headers
    })
    if (session) throw redirect("/settings/profile")
}

export async function getProfile() {
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
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({
        headers
    })
    if (!session) return null
    return session.user
}

export async function revokeSession() {
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
    await revokeSession();
    throw redirect("/auth/signin")
}