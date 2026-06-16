import { LockOpenIcon } from "lucide-solid"
import { Show } from "solid-js"
import { authClient } from "~/auth/authClient"
import { STORAGE_DOMAIN } from "~/utils/env"
import { NavItem } from "./NavItem"

export function NavUserComponent() {
    const session = authClient.useSession()

    return (
        <Show
            when={session().data?.user}
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
