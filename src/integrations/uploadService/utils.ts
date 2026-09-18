import z from "zod";

export const FileUploadSchema = z.object({
    prefix: z.string().optional(),
    files: z.array(z.object({
        filename: z.string(),
        contentType: z.string().refine(val => /^(image|video|audio)/.test(val)),
        contentLength: z.number().max(8 * 1024 * 1024),
        metadata: z.record(z.string(), z.string()).optional()
    }))
})

export const ImageUploadSchema = z.object({
    prefix: z.string().optional(),
    files: z.array(z.object({
        filename: z.string(),
        contentType: z.string().startsWith("image/"),
        contentLength: z.number().max(8 * 1024 * 1024),
        metadata: z.record(z.string(), z.string()).optional()
    }))
})

export type SignedUrlResponse = {
    key: string,
    signedUrl: string
}[]
