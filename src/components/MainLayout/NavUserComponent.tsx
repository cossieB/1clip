import { LockOpenIcon } from "lucide-solid"
import { Show } from "solid-js"
import { STORAGE_DOMAIN } from "~/utils/env"
import { NavItem } from "./NavItem"
import { CustomSession } from "~/utils/types"

export function NavUserComponent(props: {session: CustomSession}) {
    
    return (
        <Show
            when={props.session}
            fallback={
                <NavItem
                    href="/auth/signin"
                    icon={<LockOpenIcon />}
                    label="Login"
                />
            }>
            {user =>
                <NavItem
                    href="/settings/profile"
                    icon={<img src={STORAGE_DOMAIN + user().image} />}
                    label={user().displayUsername!}
                />
            }
        </Show>
    )
}
