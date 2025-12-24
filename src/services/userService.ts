import { notFound, redirect } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import z from "zod";
import * as userRepository from "~/repositories/userRepository"
import { forceLogin, getCurrentUser as getCurrentUser } from "./authService";
import * as uploadService from "~/services/uploadService/cloudflareUploadService"
import assert from "node:assert";

export const getLoggedInUser = createServerFn()
    .handler(async () => {
        const session = await getCurrentUser()
        if (!session) throw notFound()
        const user = (await userRepository.findById(session.id)).at(0)
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
    .inputValidator((fd: unknown) => {
        if (fd instanceof FormData) return fd
        throw new Response(null, { status: 400 })
    })
    .handler(async ({ data }) => {
        const r2Domain = process.env.R2_DOMAIN
        assert(r2Domain)
        const user = await getCurrentUser()
        if (!user) throw new Response(null, { status: 401 })

        const UserUpdateSchema = z.object({
            displayName: z.string().min(3).max(15).optional(),
            bio: z.string().max(255).optional(),
            image: z.instanceof(File)
                .refine(file => file.type.startsWith("image/"))
                .refine(file => file.size < 2500000, "File too large")
                .optional(),
            banner: z.instanceof(File)
                .refine(file => file.type.startsWith("image/"))
                .refine(file => file.size < 2500000, "File too large")
                .optional(),
            dob: z.iso.date().nullish(),
            location: z.string().max(100).nullish()
        })
        const obj = Object.fromEntries(data.entries())
        const parsed = UserUpdateSchema.parse(obj)
        if (Object.keys(parsed).length === 0) throw Response.json({ error: "Nothing to update" }, { status: 400 })

        const prom1 = parsed.image && uploadService.uploadFromServer(parsed.image, `users/${user.id}/avatars/`)
        const prom2 = parsed.banner && uploadService.uploadFromServer(parsed.banner, `users/${user.id}/banners/`)

        try {
            const [avatar, banner] = await Promise.all([prom1, prom2])

            await userRepository.updateUser(user.id, {
                ...parsed, 
                image: avatar ? r2Domain+avatar.Key : undefined, 
                banner: banner ? r2Domain + banner.Key : undefined
            });
            return new Response(null, { status: 200 })
        }
        catch (error) {
            console.log(error)
            throw Response.json({ error: "Something went wrong" }, { status: 500 })
        }
    })