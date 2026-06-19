import z from "zod";
import { generateSignedUrl } from "./cloudflareUploadService";
import { authedOnly } from "~/middleware/authenticate";
import { SignedUrlSchema } from "~/zod/upload";
import { parseZod } from "~/utils/parseZod";

export async function getSignedUrls(args: z.input<typeof SignedUrlSchema>) {
    'use server'
    const data = parseZod(SignedUrlSchema, args)
    const user = authedOnly()
    return await Promise.all(data.files.map(obj => generateSignedUrl(
        obj.filename,
        obj.contentType,
        obj.contentLength,
        [...data.paths, user.id],
        obj.metadata
    )))
}    