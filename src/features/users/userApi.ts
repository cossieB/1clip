import { query } from "@solidjs/router";
import { getRequestEvent, redirect, respond } from "@solidjs/web";
import z from "zod";
import * as userRepository from "./userRepository"
import { getCurrentUser } from "../auth/serverFn";

export const getYou = query(async () => {
    'use server'
    const session = await getCurrentUser()
    
    if (!session) throw redirect("/?dialog=signin")
    return getUser(session.user.id)
}, "you")

export const getUser = query(async (id: string) => {
    'use server'
    const parse = z.uuidv7().safeParse(id)
    if (!parse.success) throw respond(new Error("User not found"), {status: 404})
    return userRepository.findById(parse.data)
}, "user")