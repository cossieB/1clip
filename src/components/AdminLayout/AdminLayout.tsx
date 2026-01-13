import { HouseIcon, Dice5Icon, CodeIcon, BriefcaseBusiness, CirclePlus } from "lucide-solid";
import { JSXElement, Show } from "solid-js";
import { NavItem } from "../MainLayout/NavItem";
import styles from "./AdminLayout.module.css"
import { Link } from "@tanstack/solid-router";

export function AdminLayout(props: { children: JSXElement }) {
    return (
        <div class={styles.container}>
            <AdminNav />
            <main>
                {props.children}
            </main>
        </div>
    )
}

function AdminNav() {
    return (
        <nav class={styles.nav}>
            <ul>
                <AdminLi href="games">
                    Games
                </AdminLi>
                <AdminLi href="developers">
                    Developers
                </AdminLi>
                <AdminLi href="publishers">
                    Publishers
                </AdminLi>
                <AdminLi href="platforms">
                    Platforms
                </AdminLi>
                <AdminLi href="actors">
                    Actors
                </AdminLi>
                <li>
                    Admin
                </li>
            </ul>
        </nav>
    )
}

type Props = {
    href: 'developers' | 'games' | 'publishers' | 'actors' | 'platforms';
    children: JSXElement;
};

export function AdminNavLink(props: Props) {
    return (
        <div class={styles.label}>
            <Link activeProps={{class: styles.active}}  to={`/admin/${props.href}`}>
                {props.children}
            </Link>
        </div>
    );
}

export function AdminLi(props: Props) {
    return (
        <li>
            <AdminNavLink {...props} />
            <div class={styles.addBtn}>
                <Link activeProps={{class: styles.active}} to={`/admin/${props.href}/add`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-plus" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5z" />
                        <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911l-1.318.016z" />
                    </svg>
                </Link>
            </div>
        </li>
    )
}