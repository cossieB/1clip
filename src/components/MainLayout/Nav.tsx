import { BriefcaseBusiness, MenuIcon, CodeIcon, Dice5Icon, HouseIcon, CirclePlus, Search } from "lucide-solid";
import { Setter, Show } from "solid-js";
import { authClient } from "~/auth/authClient";
import { NavItem } from "./NavItem";
import styles from "./MainLayout.module.css"
import clickOutside from "~/lib/clickOutside";
import { NavUserComponent } from "./NavUserComponent";
import { clientOnly } from "@solidjs/start";

false && clickOutside

const NavNotifications = clientOnly(() => import("./NavNotifications"))

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
                <aside class={styles.siteTitle}>
                    1Clip
                </aside>
            </div>
            <ul>
                <NavItem
                    href="/"
                    label="Home"
                    icon={<HouseIcon />}
                />
                <NavItem
                    href="/games"
                    label="Games"
                    icon={<Dice5Icon />}
                />
                <NavItem
                    href="/developers"
                    label="Developers"
                    icon={<CodeIcon />}
                />
                <NavItem
                    href="/publishers"
                    label="Publishers"
                    icon={<BriefcaseBusiness />}
                />
                <NavItem
                    href="/search/posts"
                    label="Search"
                    icon={<Search />}
                />
                <Show when={session().data?.user}>
                    <>
                        <NavItem
                            href="/posts/create"
                            icon={<CirclePlus />}
                            label="Create"
                            style={{ color: "var(--neon-pink)" }}
                        />
                            <NavNotifications />
                    </>
                </Show>
                <NavUserComponent />
            </ul>
        </nav>
    )
}