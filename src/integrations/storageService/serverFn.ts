import { createServerFn } from "@tanstack/solid-start"
import assert from "assert"
import { adminOnlyMiddleware, verifiedOnlyMiddleware } from "~/middleware/authorization"
import { rateLimiter } from "~/utils/rateLimiter.server"
import { ImageUploadSchema, FileUploadSchema } from "./zod"
import {generateAndStoreSignedUrls} from "./utils"

export const getLogoSignedUrls = createServerFn({method: "POST"})
    .middleware([adminOnlyMiddleware])
    .validator(ImageUploadSchema)
    .handler(async ({ data, context: { user } }) => {
        return generateAndStoreSignedUrls(data, user.id, "logos")
    })

export const getPeopleSignedUrls = createServerFn({method: "POST"})
    .middleware([adminOnlyMiddleware])
    .validator(ImageUploadSchema)
    .handler(async ({ data, context: { user } }) => {
        return generateAndStoreSignedUrls(data, user.id, "people")
    })

export const getUsersSignedUrls = createServerFn({method: "POST"})
    .middleware([verifiedOnlyMiddleware])
    .validator(ImageUploadSchema)
    .handler(async ({ data, context: { user } }) => {
        await rateLimiter("upload", user.id, 5, 60)
        return generateAndStoreSignedUrls(data, user.id, "users")
    })

export const getGamesSignedUrls = createServerFn({method: "POST"})
    .middleware([adminOnlyMiddleware])
    .validator(FileUploadSchema)
    .handler(async ({ data, context: { user } }) => {
        assert(data.prefix)
        return generateAndStoreSignedUrls(data, user.id, data.prefix)
    })
