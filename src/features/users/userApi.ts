import { query } from "@solidjs/router";
import { redirect, respond } from "@solidjs/web";
import z from "zod";
import * as userRepository from "./userRepository"
import { getCurrentUser } from "../auth/serverFn";
import { paths } from "~/router";
import { UpdateUserSchema } from "./utils/zod";
import { GET } from "@solidjs/web/server-functions/server";

export const getUser = query(async (id: string) => {
    'use server'
    const parse = z.uuidv7().safeParse(id)
    if (!parse.success) throw respond(new Error("User not found"), { status: 404 })
    return userRepository.findById(parse.data)
}, "user")

export async function updateUser(profile: z.input<typeof UpdateUserSchema>) {
    'use server'
    const u = UpdateUserSchema.parse(profile)
    const session = await getCurrentUser();
    if (!session) throw redirect(paths({ dialog: "signin" }))
    await userRepository.updateUser(session.user.id, u)
}

export const getProfile = GET(async () => {
    'use server'
    const session = await getCurrentUser()
    if (!session) throw redirect(paths({ dialog: "signin" }))
    return getUser(session.user.id)
})