import { getRequestEvent } from "solid-js/web"
import { AppError } from "~/utils/AppError"
import { type FetchEvent } from "@solidjs/start/server";
import { getCurrentUser } from "~/services/authService";

export async function authenticate(event: FetchEvent) {
    const user = await getCurrentUser();
    event.locals.user = user
    console.log(user)
}

export function authedOnly() {
    'use server'
    const event = getRequestEvent()!
    const user = event?.locals.user;
    if (!user) throw new AppError("Please login", 401)
    return user
}