import { BriefcaseBusiness, MenuIcon, CodeIcon, Dice5Icon, HouseIcon, CirclePlus, Search } from "lucide-solid";
import { Setter, Show } from "solid-js";
import { authClient } from "~/auth/authClient";
import { NavItem } from "./NavItem";
import styles from "./MainLayout.module.css"
import clickOutside from "~/lib/clickOutside";
import { ClientOnly } from "@tanstack/solid-router";
import { NavNotifications } from "./NavNotifications";
import { NavUserComponent } from "./NavUserComponent";
false && clickOutside

export function Nav(props: { setOpen: Setter<boolean> }) {
    const session = authClient.useSession()
    return (
        <nav
            use:clickOutside={() => {
                if (window.innerWidth < 768)
                    props.setOpen(false)
            }}
            class={styles.nav} >
            <div class={styles.topItem}>
                <button class={styles.toggleBtn} onclick={() => props.setOpen(prev => !prev)}>
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
                <NavItem
                    to="/search/posts"
                    label="Search"
                    icon={<Search />}
                />
                <Show when={session().data?.user}>
                    <>
                        <NavItem
                            to="/posts/create"
                            icon={<CirclePlus />}
                            label="Create"
                            style={{ color: "var(--neon-pink)" }}
                        />
                        <ClientOnly>
                            <NavNotifications />
                        </ClientOnly>
                    </>
                </Show>
                <NavUserComponent />
            </ul>
        </nav>
    )
}