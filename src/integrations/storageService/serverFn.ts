import assert from "assert"
import { rateLimiter } from "~/utils/rateLimiter.server"
import { ImageUploadSchema, FileUploadSchema } from "./zod"
import { generateAndStoreSignedUrls } from "./utils"
import { getCurrentUser } from "~/features/auth/serverFn"
import { respond } from "@solidjs/web"
import { HttpStatusCode } from "~/utils/statusCodes"
import z from "zod"

const adminOnly = async () => {
    const userSession = await getCurrentUser();
    if (!userSession || userSession.user.role != "admin") throw respond("Unauthorized", {
        status: HttpStatusCode.UNAUTHORIZED
    })
    return userSession
}

export async function getLogoSignedUrls(img: z.input<typeof ImageUploadSchema>) {
    'use server'
    const userSession = await adminOnly()
    const data = ImageUploadSchema.parse(img)
    return generateAndStoreSignedUrls(data, userSession.user.id, "logos")
}

export async function getPeopleSignedUrls(img: z.input<typeof ImageUploadSchema>) {
    'use server'
    const userSession = await adminOnly()
    const data = ImageUploadSchema.parse(img)
    return generateAndStoreSignedUrls(data, userSession.user.id, "people")
}

export async function getUsersSignedUrls(img: z.input<typeof ImageUploadSchema>) {
    'use server'
    const userSession = await getCurrentUser()
    if (!userSession) throw respond("Unauthorized", {
        status: HttpStatusCode.UNAUTHORIZED
    })
    const data = ImageUploadSchema.parse(img)
    await rateLimiter("upload", userSession.user.id, 5, 60)
    return generateAndStoreSignedUrls(data, userSession.user.id, "users")
}

export async function getGamesSignedUrls(img: z.input<typeof FileUploadSchema>) {
    'use server'
    const userSession = await adminOnly()
    const data = ImageUploadSchema.parse(img)    
    assert(data.prefix)
    return generateAndStoreSignedUrls(data, userSession.user.id, data.prefix)
}