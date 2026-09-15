import z from "zod";

export const UserImageSchema = z.object({
        size: z.number().lte(2 * 1024 * 1024),
        contentType: z.string().startsWith("image"),
        filename: z.string(),
    }).optional()