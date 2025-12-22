import { notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import * as userRepository from "~/repositories/userRepository"
import { getCurrentUserId, revokeSession } from "./authService";

export const getLoggedInUser = createServerFn()
    .handler(async () => {
        const id = await getCurrentUserId()
        if (!id) throw notFound()
        const user = (await userRepository.findById(id)).at(0)
        if (!user) throw notFound()
        return user
    })

export const getUserByUsernameFn = createServerFn()
    .inputValidator((username: string) => username)
    .handler(async ({ data }) => userRepository.findByUsername(data))

export const getUserByIdFn = createServerFn()
    .inputValidator((id: unknown) => {
        const validated = z.uuid().safeParse(id)
        if (validated.error)
            throw notFound()
        else
            return validated.data
    })
    .handler(async ({ data }) => userRepository.findById(data))

export const updateCurrentUser = createServerFn()
    .inputValidator(z.object({
        displayName: z.string().min(3).max(15).optional(),
        bio: z.string().max(255).optional(),
        image: z.url().optional(),
        banner: z.url().optional(),
        dob: z.iso.date().nullish(),
        location: z.string().max(100).nullish()
    }))
    .handler(async ({ data }) => {
        const id = await getCurrentUserId()
        if (!id) {
            await revokeSession()
            throw Response.json({error: "User not found"}, { status: 400 })
        }
        if (Object.keys(data).length === 0) throw Response.json({error: "Nothing to update"}, { status: 400 })

        try {
            const result = await userRepository.updateUser(id, data);
            if (result.rowCount === 0) {
                await revokeSession();
                return Response.json({error: "Please login again"})
            }
            return new Response(null, { status: 200 })
        } 
        catch (error) {
            throw Response.json({error: "Something went wrong"}, { status: 500 })
        }
    })