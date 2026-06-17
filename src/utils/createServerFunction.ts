import z from "zod";
import { AppError } from "./AppError";
import { HttpStatusCode } from "./statusCodes";

// export function createServerFunction<V>(cb: () => V): () => V;

// export function createServerFunction<T, V>(validator: z.ZodType<T>, cb: (arg: T) => V): (rawInput: T) => V;

// export function createServerFunction<T, V>(arg1: (() => V) | z.ZodType<T>, arg2?: (arg: T) => V) {
//     return (rawInput: T) => {
//         if (typeof arg1 == "function") return arg1()

//         const validated = arg1.safeParse(rawInput)
//         if (!validated.success) throw new AppError(String(validated.error), HttpStatusCode.BAD_REQUEST);
//         return arg2!(validated.data)
//     }
// }

export function createServerFunction() {
    return new ServerFunctionBuilder()
}

class ServerFunctionBuilder {

    setValidator = <Out, In>(validator: z.ZodType<Out, In>) => {
        return new ServerFunctionWithValidator<Out, In>(validator)
    }
    handler = <V>(cb: () => V) => {
        return cb
    }
}

class ServerFunctionWithValidator<Out, In> {
    constructor(private readonly validator: z.ZodType<Out>) { }
    handler = <V>(cb: (arg: Out) => V) => {
        return (input: In) => {
            const validated = this.validator.safeParse(input);
            if (!validated.success) throw new AppError(String(validated.error), HttpStatusCode.BAD_REQUEST);
            return cb(validated.data)
        }
    }
}