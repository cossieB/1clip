import { createMemo, ParentProps } from "solid-js";
import { ensureAdminOrRedirect } from "~/features/auth/utils/ensureAuth";

export function AdminLayout(props: ParentProps) {
    createMemo(() => ensureAdminOrRedirect(), {
        deferStream: true
    })

    return props.children
}