import { createAsync, query, redirect } from "@solidjs/router";
import { JSXElement } from "solid-js";
import { getRequestEvent } from "solid-js/web";
import { HttpStatusCode } from "~/utils/statusCodes";

const getSession = query(async () => {
    'use server'
    const user = getRequestEvent()?.locals.user
    if (user) throw redirect("/settings/profile", {
        status: HttpStatusCode.TEMPORARY_REDIRECT,
        headers: {
            "Cache-Control": "no-store, no-cache"
        }
    })
}, "hasSession")

export default function AuthLayout(props: {children: JSXElement}) {
    createAsync(() => getSession())
    return props.children
}