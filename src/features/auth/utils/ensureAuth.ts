import { query } from '@solidjs/router'
import { getCurrentUser } from '../serverFn'
import { redirect, respond } from '@solidjs/web'
import { paths } from '~/router'

export async function ensureAuthed() {
    'use server'
    const userSession = await getCurrentUser()
    if (!userSession) throw respond(new Error("Please login first"), { status: 401 })
    return userSession
}

export async function ensureVerified() {
    'use server'
    const userSession = await ensureAuthed()
    if (!userSession.user.emailVerified) throw respond(new Error("Please verify your email first"), { status: 403 })
    return userSession
}

export async function ensureAdmin() {
    'use server'
    const userSession = await ensureAuthed()
    if (userSession.user.role !== "admin") throw respond(new Error("Forbidden"), { status: 403 })
    return userSession
}

export const ensureAuthOrRedirect = query(async () => {
    'use server'
    const userSession = await getCurrentUser()
    if (!userSession) return redirect(paths({dialog: "signin"}))
}, "authcheck")

export const ensureAdminOrRedirect = query(async () => {
    'use server'
    const userSession = await getCurrentUser()
    if (!userSession || userSession.user.role.toLowerCase() !== "admin") return redirect(paths())
}, "admincheck")