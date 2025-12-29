import { notFound, redirect } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import * as userRepository from "~/repositories/userRepository"
import { forceLogin, getCurrentUser as getCurrentUser } from "./auth";
import * as uploadService from "~/services/uploadService/cloudflareUploadService"
import assert from "node:assert";
import { authedMiddleware } from "~/middleware/authorization";

export const getLoggedInUser = createServerFn()
    .handler(async () => {
        const session = await getCurrentUser()
        if (!session) throw notFound()
        const user = (await userRepository.findById(session.id)).at(0);
        if (!user) {
            return forceLogin()
        }
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

export const updateCurrentUser = createServerFn({ method: "POST" })
    .middleware([authedMiddleware])
    .inputValidator(z.object({
        displayName: z.string().min(3).max(15).optional(),
        bio: z.string().max(255).optional(),
        image: z.string().optional(),
        banner: z.string().optional(),
        dob: z.iso.date().nullish(),
        location: z.string().max(100).nullish()
    }))
    .handler(async ({ data, context: { user } }) => {
        const r2Domain = process.env.R2_DOMAIN
        assert(r2Domain)

        if (!user.emailVerified) throw Response.json("Please verify your account", { status: 403 })

        if (Object.keys(data).length === 0) throw Response.json({ error: "Nothing to update" }, { status: 400 })

        try {
            await userRepository.updateUser(user.id, data);
            return new Response(null, { status: 200 })
        }
        catch (error) {
            console.log(error)
            throw Response.json({ error: "Something went wrong" }, { status: 500 })
        }
    })