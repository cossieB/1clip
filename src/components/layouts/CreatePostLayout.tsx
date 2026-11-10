import { query, useLocation, useNavigate } from "@solidjs/router";
import { getRequestEvent, redirect } from "@solidjs/web";
import { createEffect, createMemo, ParentProps } from "solid-js";
import { session } from "~/features/auth/authApi";
import { getCurrentUser } from "~/features/auth/serverFn";
import { NavTabs } from "~/NavTabs/NavTabs";
import { paths } from "~/router";

const getSession = query(async () => {
    'use server'
    const userSession = await getCurrentUser()
    const urlString = getRequestEvent()?.request.url;
    const pathname = urlString ? new URL(urlString).pathname : "/posts/create"
    if (!userSession) throw redirect(paths({ dialog: "signin", redirect: pathname }))
}, "s")

export function CreatePostLayout(props: ParentProps) {
    createMemo(() => getSession(), { deferStream: true})
    const navigate = useNavigate()
    const location = useLocation()
    createEffect(() => session().data, (s) => {
        if (!s) navigate(location.pathname + `?dialog=signin`)
    })
    return (
        <>
            <NavTabs
                tabs={[{
                    href: paths.posts.create(),
                    label: "Clip or Text"
                }, {
                    href: paths.squads.create(),
                    label: "Lookin For Group"
                }]}
            />
            {props.children}
        </>
    )
}