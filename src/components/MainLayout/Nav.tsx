import { BriefcaseBusiness, LockOpenIcon, MenuIcon, CodeIcon, Dice5Icon, HouseIcon, CirclePlus, Search, BellIcon } from "lucide-solid";
import { Setter, Show } from "solid-js";
import { authClient } from "~/auth/authClient";
import { STORAGE_DOMAIN } from "~/utils/env";
import { NavItem } from "./NavItem";
import styles from "./MainLayout.module.css"
import clickOutside from "~/lib/clickOutside";
import { useNotificationContext } from "~/features/notifications/hooks/useNotificationContext";
import { ClientOnly } from "@tanstack/solid-router";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { NotificationsSchema, UserNotification } from "~/features/notifications/utils/NotificationsSchema";
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
    const {getItem, setItem} = useLocalStorage("notifications", NotificationsSchema.array())
    
    stream.onmessage = (event: MessageEvent) => {
        const oldNotifications = getItem() ?? []
        const data = JSON.parse(event.data)
        setNotifications(prev => [...prev, data])
        setItem([...oldNotifications, data].toReversed())
    }
    return (
        <div class={styles.notifs}>
            <NavItem
                to="/notifications"
                icon={<BellIcon />}
                label="Notifications"
            />
            <Show when={notifications().length > 0}>
                <span class={styles.notifNum}>
                    {Math.min(notifications().length, 9)}
                </span>
            </Show>
        </div>
    )
}