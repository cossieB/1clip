import { useNavigate } from "@solidjs/router";
import { createEffect, createMemo, ParentProps } from "solid-js";
import { session } from "~/features/auth/authApi";
import { NavTabs } from "~/components/NavTabs/NavTabs";
import { paths } from "~/router";
import { getProfileFn } from "~/features/users/userApi";

export function SettingsLayout(props: ParentProps) {
    createMemo(() => getProfileFn(), {
        deferStream: true
    })    

    return (
        <>
            <NavTabs
                tabs={[{
                    href: paths.profile(),
                    label: "Profile"
                }, {
                    href: paths.security(),
                    label: "Security"
                }]}
            />
            {props.children}
        </>
    )
}