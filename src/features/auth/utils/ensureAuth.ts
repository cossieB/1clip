import 'server-only'
import { getCurrentUser } from '../serverFn'
import { respond } from '@solidjs/web'

export async function ensureAuthed() {
    const userSession = await getCurrentUser()
    if (!userSession) throw respond(new Error("Please login first"), { status: 401 })
    return userSession
}

export async function ensureVerified() {
    const userSession = await ensureAuthed()
    if (!userSession.user.emailVerified) throw respond(new Error("Please verify your email first"), { status: 403 })
    return userSession
}

export async function ensureAdmin() {
    const userSession = await ensureAuthed()
    if (userSession.user.role !== "admin") throw respond(new Error("Forbidden"), { status: 403 })
    return userSession
}

