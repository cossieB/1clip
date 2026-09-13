import z from "zod";

export const LimitOffsetSchema = z.object({
    limit: z.number().default(50),
    offset: z.number().default(0)
}).optional()

export const AdminImageSchema = z.object({
        size: z.number().lte(8 * 1024 * 1024),
        contentType: z.string().startsWith("image"),
        filename: z.string(),
    }).optional()