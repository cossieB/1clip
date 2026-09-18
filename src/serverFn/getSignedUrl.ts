import { createServerFn } from "@tanstack/solid-start";
import assert from "node:assert";
import z from "zod";
import { generateSignedUrl } from "~/integrations/uploadService/cloudflareUploadService.server";
import { FileUploadSchema, ImageUploadSchema } from "~/integrations/uploadService/utils";
import { adminOnlyMiddleware, verifiedOnlyMiddleware } from "~/middleware/authorization";
import { generateUniqueFilename } from "~/utils/mediaSrc";
import { rateLimiter } from "~/utils/rateLimiter.server";
import { redis } from "~/utils/redis.server";

async function process(data: z.infer<typeof FileUploadSchema>, userId: string, prefix: string) {
    const urls = await Promise.all(
        data.files.map((f) =>
            generateSignedUrl({
                contentLength: f.contentLength,
                contentType: f.contentType,
                key: `${prefix}/${generateUniqueFilename(f.filename)}`,
            })
        )
    )
    await redis.zAdd("pending_uploads", urls.map(u => ({
        score: Date.now() + 86400000,
        value: JSON.stringify({
            userId,
            reference: prefix,
            key: u.key,
        })
    })))
    return urls
}

export const getLogoSignedUrls = createServerFn()
    .middleware([adminOnlyMiddleware])
    .validator(ImageUploadSchema)
    .handler(async ({ data, context: { user } }) => {
        return process(data, user.id, "logos")
    })

export const getPeopleSignedUrls = createServerFn()
    .middleware([adminOnlyMiddleware])
    .validator(ImageUploadSchema)
    .handler(async ({ data, context: { user } }) => {
        return process(data, user.id, "people")
    })

export const getUsersSignedUrls = createServerFn()
    .middleware([verifiedOnlyMiddleware])
    .validator(ImageUploadSchema)
    .handler(async ({ data, context: { user } }) => {
        await rateLimiter("upload", user.id, 5, 60)
        return process(data, user.id, "users")
    })

export const getGamesSignedUrls = createServerFn()
    .middleware([adminOnlyMiddleware])
    .validator(FileUploadSchema)
    .handler(async ({data, context: {user}}) => {
        assert(data.prefix)
        return process(data, user.id, data.prefix)
    })