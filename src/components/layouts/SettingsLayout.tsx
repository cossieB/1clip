import { createMemo, ParentProps } from "solid-js";
import { ensureAuthOrRedirect } from "~/features/auth/authApi";
import { NavTabs } from "~/components/NavTabs/NavTabs";
import { paths } from "~/router";
import { Meta } from "@solidjs/meta";

export function SettingsLayout(props: ParentProps) {
    createMemo(() => ensureAuthOrRedirect(), {
        deferStream: true
    })    

    return (
        <>
            <Meta name="robots" content="noindex" />            
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