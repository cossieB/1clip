import { query } from "@solidjs/router";
import { redirect, respond } from "@solidjs/web";
import z from "zod";
import * as userRepository from "./userRepository"
import { getCurrentUser } from "../auth/serverFn";
import { paths } from "~/router";
import { UpdateUserSchema } from "./utils/zod";
import { GET } from "@solidjs/web/server-functions/server";
import { storageService } from "~/integrations/storageService/index.server";
import { orphanedFileService } from "~/services/orphanedFileService";
import { zodSafeParse } from "~/utils/zodSafeParse";

export const getUser = query(async (id: string) => {
    'use server'
    const parse = z.uuidv7().safeParse(id)
    if (!parse.success) throw respond(new Error("User not found"), { status: 404 })
    return userRepository.findById(parse.data)
}, "user")

export async function updateUser(profile: z.input<typeof UpdateUserSchema>) {
    'use server'
    const data = zodSafeParse(UpdateUserSchema, profile)
    const session = await getCurrentUser();
    if (!session) throw redirect(paths({ dialog: "signin" }))
    const old = (await userRepository.updateUser(session.user.id, data))[0]
    if (data.banner != old.oldBanner) {
        storageService.deleteObject(old.oldBanner);
        orphanedFileService.removePendingUpload(data.banner!)
    }

    if (data.image != old.oldAvatar) {
        storageService.deleteObject(old.oldAvatar)
        orphanedFileService.removePendingUpload(data.image!)
    }
}

export const getProfile = GET(async () => {
    'use server'
    const session = await getCurrentUser()
    if (!session) throw redirect(paths({ dialog: "signin" }))
    return getUser(session.user.id)
})