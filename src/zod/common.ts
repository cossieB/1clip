import z from "zod";

export const LimitOffsetSchema = z.object({
    limit: z.coerce.number().catch(50).default(50),
    offset: z.coerce.number().catch(0).default(0)
}).optional()