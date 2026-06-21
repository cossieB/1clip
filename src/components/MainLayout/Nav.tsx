import { BriefcaseBusiness, MenuIcon, CodeIcon, Dice5Icon, HouseIcon, CirclePlus, Search } from "lucide-solid";
import { Setter, Show, Suspense } from "solid-js";
import { NavItem } from "./NavItem";
import styles from "./MainLayout.module.css"
import clickOutside from "~/lib/clickOutside";
import { NavUserComponent } from "./NavUserComponent";
import { clientOnly } from "@solidjs/start";
import { createAsync } from "@solidjs/router";
import { getActiveSession } from "~/services/authService";

false && clickOutside

const NavNotifications = clientOnly(() => import("./NavNotifications"))

export function Nav(props: { setOpen: Setter<boolean> }) {
    const session = createAsync(() => getActiveSession())
    
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
                    href="/posts"
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
                <Suspense>
                    <Show when={session()}>
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
                    <NavUserComponent session={session()!} />
                </Suspense>
            </ul>
        </nav>
    )
}