import { ZodSafeParseResult, ZodType } from "zod";
import { HttpStatusCode } from "./statusCodes";
import { AppError } from "./AppError";

export function parseZod<T>(validator: ZodType<T>, data: unknown) {
    const result = validator.safeParse(data)
    if (!result.success) {
        throw new AppError(JSON.stringify(result.error), HttpStatusCode.BAD_REQUEST)
    }
    return result.data
}