import { BriefcaseBusiness, LockOpenIcon, MenuIcon, CodeIcon, Dice5Icon, HouseIcon } from "lucide-solid";
import styles from "./MainLayout.module.css"
import { Show, type JSXElement } from "solid-js";
import { Link, LinkComponentProps } from "@tanstack/solid-router";
import { authClient } from "~/auth/authClient";
import { Require } from "~/lib/utilityTypes";

export function Nav(props: { toggleNav(): void }) {

    return (
        <nav class={styles.nav} >
            <div class={styles.topItem}>
                <button class={styles.toggleBtn} onclick={props.toggleNav}>
                    <MenuIcon />
                </button>
                <aside>
                    GG
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
                <UserComponent />
            </ul>
        </nav>
    )
}

type NavItemProps = {
    label: string
    icon: JSXElement
} &  Require<LinkComponentProps, 'to'>

function NavItem(props: NavItemProps) {
    return (
        <Link to={props.to} activeProps={{ class: styles.active }} >
            <li class={`${styles.navItem}`}>
                {props.icon}
                <span> {props.label} </span>
            </li>
        </Link>
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
                    icon={<img src={user().image ?? "/favicon.ico"} />}
                    label={user().displayUsername!}
                />
            }
        </Show>
    )
}