import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import * as userRepository from "~/repositories/userRepository"
import { forceLogin, getCurrentUser as getCurrentUser } from "./auth";
import assert from "node:assert";
import { authedMiddleware, verifiedOnlyMiddleware } from "~/middleware/authorization";
import { AppError } from "~/utils/AppError";

export const getLoggedInUser = createServerFn()
    .handler(async () => {
        const session = await getCurrentUser()
        if (!session) throw notFound()
        const user = await userRepository.findById(session.id);
        if (!user) {
            return forceLogin()
        }
        return user
    })

export const getUserByUsernameFn = createServerFn()
    .inputValidator((username: string) => username)
    .handler(async ({ data }) => {
        const user = await userRepository.findByUsername(data);
        if (!user) throw notFound()
        return user
    })

export const getUserByIdFn = createServerFn()
    .inputValidator((id: unknown) => {
        const validated = z.uuid().safeParse(id)
        if (validated.error)
            throw notFound()
        else
            return validated.data
    })
    .handler(async ({ data }) => userRepository.findById(data))

export const updateCurrentUser = createServerFn({ method: "POST" })
    .middleware([verifiedOnlyMiddleware])
    .inputValidator(z.object({
        displayName: z.string().min(3).max(15).optional(),
        bio: z.string().max(255).optional(),
        image: z.string().optional(),
        banner: z.string().optional(),
        dob: z.iso.date().nullish(),
        location: z.string().max(100).nullish()
    }))
    .handler(async ({ data, context: { user } }) => {

        if (Object.keys(data).length === 0) throw new AppError("Nothing to update", 400)

        try {
            const u = await userRepository.updateUser(user.id, data);
            return new Response(null, { status: 200 })
        }
        catch (error) {
            console.log(error)
            throw new AppError("Something went wrong", 500)
        }
    })