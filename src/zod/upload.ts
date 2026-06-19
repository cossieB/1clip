import z from "zod";

export const SignedUrlSchema = z.object({
    paths: z.string().array(),
    files: z.array(z.object({
        filename: z.string(),
        contentType: z.string().refine(val => /^(image|video|audio)/.test(val)),
        contentLength: z.number(),
        metadata: z.record(z.string(), z.string()).optional()
    }))
})