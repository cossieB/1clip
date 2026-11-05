import { useNavigate } from "@solidjs/router";
import { createEffect, ParentProps } from "solid-js";
import { session } from "~/features/auth/authApi";
import { NavTabs } from "~/NavTabs/NavTabs";
import { paths } from "~/router";

export function SettingsLayout(props: ParentProps) {
    const navigate = useNavigate()

    createEffect(() => session().data, (s) => {
        if (!s) navigate(paths({ dialog: "signin" }))
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