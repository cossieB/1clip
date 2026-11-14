import z from "zod";

export const LimitOffsetSchema = z.object({
    limit: z.int().default(50),
    offset: z.int().default(0)
}).optional()
