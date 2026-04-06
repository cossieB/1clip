import { BriefcaseBusiness, LockOpenIcon, MenuIcon, CodeIcon, Dice5Icon, HouseIcon, CirclePlus, Search, BellIcon } from "lucide-solid";
import { createSignal, onCleanup, Setter, Show } from "solid-js";
import { authClient } from "~/auth/authClient";
import { STORAGE_DOMAIN } from "~/utils/env";
import { NavItem } from "./NavItem";
import styles from "./MainLayout.module.css"
import clickOutside from "~/lib/clickOutside";
import { NotificationsProvider } from "../Notifications/NotificationsProvider";
import { useNotificationContext } from "~/hooks/useNotificationContext";
import { NotifMessage } from "~/integrations/notificationService/notificationService.interface";
import { ClientOnly } from "@tanstack/solid-router";
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
                            <NotificationsProvider>
                                <NavNotifications />
                            </NotificationsProvider>
                        </ClientOnly>
                    </>
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

function NavNotifications() {
    const { notifications, setNotifications } = useNotificationContext()
    const stream = new EventSource("/api/notifications")
    stream.onmessage = (event: MessageEvent<NotifMessage>) => {
        setNotifications(prev => [...prev, event.data])
    }
    return (
        <div class={styles.notifs}>
            <NavItem
                to="/"
                icon={<BellIcon />}
                label="Notifications"
            />
            <span class={styles.notifNum}>
                {notifications().length}
            </span>
        </div>
    )
}