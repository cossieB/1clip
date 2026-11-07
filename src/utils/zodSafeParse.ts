import z from "zod";
import "server-only"
import { respond } from "@solidjs/web";

export function zodSafeParse<T extends z.ZodType>(schema: T, input: unknown) {
    const result = schema.safeParse(input)
    if (!result.success) throw respond(new Error(result.error.message), {status: 400})
    return result.data
}