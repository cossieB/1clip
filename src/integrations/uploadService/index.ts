import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import { verifiedOnlyMiddleware } from "~/middleware/authorization";
import { generateSignedUrl } from "./cloudflareUploadService.server";
import { getRequestHeader } from "@tanstack/solid-start/server";

export const getSignedUrls = createServerFn()
    .middleware([verifiedOnlyMiddleware])
    .validator(z.object({
        paths: z.string().array(),
        files: z.array(z.object({
            filename: z.string(),
            contentType: z.string().refine(val => /^(image|video|audio)/.test(val)),
            contentLength: z.number(),
            metadata: z.record(z.string(), z.string()).optional()
        }))
    }))
    .handler(async ({ data, context: {user} }) => {
        const referer = getRequestHeader("Referer")
        if (!referer || !new URL(referer).pathname.startsWith("/admin")) {
            data.paths.push(user.id)
        }
        
        return await Promise.all(data.files.map(obj => generateSignedUrl({
            ...obj, 
            pathSegments: data.paths 
    })))
    })