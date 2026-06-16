import { getRequestEvent } from "solid-js/web"
import { AppError } from "~/utils/AppError"

export function authedOnly() {
    const event = getRequestEvent()!
    const user = event?.locals.user
    if (!user) throw new AppError("Please login", 401)
    return user
}