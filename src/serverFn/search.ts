import { createServerFn } from "@tanstack/solid-start";
import z from "zod";

export const searchPostsFn = createServerFn()
    .inputValidator(z.string())
    .handler(async ({data}) => {
        
    })