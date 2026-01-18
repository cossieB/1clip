import { BriefcaseBusiness, LockOpenIcon, MenuIcon, CodeIcon, Dice5Icon, HouseIcon, CirclePlus } from "lucide-solid";
import { Show } from "solid-js";
import { authClient } from "~/auth/authClient";
import { STORAGE_DOMAIN } from "~/utils/env";
import { NavItem } from "./NavItem";
import styles from "./MainLayout.module.css"

export function Nav(props: { toggleNav(): void }) {
    const session = authClient.useSession()
    return (
        <nav class={styles.nav} >
            <div class={styles.topItem}>
                <button class={styles.toggleBtn} onclick={props.toggleNav}>
                    <MenuIcon />
                </button>
                <aside>
                    1Clip
                </aside>
            </div>
            <ul>
                <NavItem
                    to="/"
                    label="Home"
                    icon={<HouseIcon />}
                />                
                <NavItem
                    to="/games"
                    label="Games"
                    icon={<Dice5Icon />}
                />
                <NavItem
                    to="/developers"
                    label="Developers"
                    icon={<CodeIcon />}
                />
                <NavItem
                    to="/publishers"
                    label="Publishers"
                    icon={<BriefcaseBusiness />}
                />
                <Show when={session().data && session().data!.user.emailVerified}>
                    <NavItem
                        to="/create"
                        icon={<CirclePlus />}
                        label="Create"
                        style={{color: "var(--neon-pink)"}}
                    />
                </Show>
                <UserComponent />
            </ul>
        </nav>
    )
}



function UserComponent() {
    const session = authClient.useSession()

    return (
        <Show
            when={session().data?.user}
            fallback={
                <NavItem
                    to="/auth/signin"
                    icon={<LockOpenIcon />}
                    label="Login"
                />
            }>
            {user =>
                <NavItem
                    to="/settings/profile"
                    icon={<img src={STORAGE_DOMAIN + user().image} />}
                    label={user().displayUsername!}
                />
            }
        </Show>
    )
}