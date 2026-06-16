import { ZodSafeParseResult } from "zod";
import { HttpStatusCode } from "./statusCodes";

export function parseZod<T>(result: ZodSafeParseResult<T>) {
    if (!result.success) {
        throw new Response(JSON.stringify(result.error), {
            status: HttpStatusCode.BAD_REQUEST
        })
    }
    return result.data
}