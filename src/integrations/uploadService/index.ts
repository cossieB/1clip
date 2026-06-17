import z from "zod";
import { generateSignedUrl } from "./cloudflareUploadService";
import { createServerFunction } from "~/utils/createServerFunction";
import { authedOnly } from "~/middleware/authedOnly";

export const getSignedUrls = createServerFunction()
    .setValidator(z.object({
        paths: z.string().array(),
        files: z.array(z.object({
            filename: z.string(),
            contentType: z.string().refine(val => /^(image|video|audio)/.test(val)),
            contentLength: z.number(),
            metadata: z.record(z.string(), z.string()).optional()
        }))
    }))
    .handler(async data => {
        const user = authedOnly()
        return await Promise.all(data.files.map(obj => generateSignedUrl(
            obj.filename, 
            obj.contentType, 
            obj.contentLength, 
            [...data.paths, user.id],
            obj.metadata
        )))
    })