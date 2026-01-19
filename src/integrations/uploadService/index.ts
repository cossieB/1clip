import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { verifiedOnlyMiddleware } from "~/middleware/authorization";
import { generateSignedUrl } from "./cloudflareUploadService";

export const getSignedUrls = createServerFn()
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        paths: z.string().array(),
        files: z.array(z.object({
            filename: z.string(),
            contentType: z.string().refine(val => /^(image|video|audio)/.test(val)),
            contentLength: z.number()
        }))
    }))
    .handler(async ({ data, context: {user} }) => {
        return await Promise.all(data.files.map(obj => generateSignedUrl(obj.filename, obj.contentType, obj.contentLength, [...data.paths, user.id])))
    })