import { createMemo, ParentProps } from "solid-js";
import { ensureAuthOrRedirect } from "~/features/auth/authApi";
import { NavTabs } from "~/components/NavTabs/NavTabs";
import { paths } from "~/router";

export function CreatePostLayout(props: ParentProps) {
    createMemo(() => ensureAuthOrRedirect(), { deferStream: true})

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