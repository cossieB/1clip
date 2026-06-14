import z from "zod";

export const LimitOffsetSchema = z.object({
    limit: z.number().default(50),
    offset: z.number().default(0)
}).optional()