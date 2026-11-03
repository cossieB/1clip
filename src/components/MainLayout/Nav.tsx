import { BellIcon, MessageSquareMoreIcon, HandshakeIcon, HomeIcon, User2Icon, VideoIcon, UnlockIcon } from "@lucide/solid"
import styles from "./MainLayout.module.css"
import { ShowWhenAuthed } from "~/features/auth/components/ShowWhenAuthed"
import { paths } from "~/router"

export function Nav() {
    return (
        <div class={styles.nav}>
            <a href="/" > <HomeIcon /> <span>Home</span></a>
            <a href="/test"> <VideoIcon /> <span>Clips</span></a>
            <a href={paths("squads")}> <HandshakeIcon /> <span>Squads</span> <b class="badge ok">12</b></a>
            <ShowWhenAuthed>
                <a href="/test"> <MessageSquareMoreIcon /> <span>Messages</span><b class="badge info">3</b></a>
                <a href="/test"> <BellIcon /> <span>Alerts</span></a>
                <a href="/test"> <User2Icon /> <span>Profile</span></a>
            </ShowWhenAuthed>
        </div>
    )
}

export function Tabbar() {
    return (
        <nav class={styles.tabbar} aria-label="Main">
            <a href="/" > <HomeIcon /> Home</a>
            <a href="test"> <VideoIcon />Clips</a>
            <ShowWhenAuthed
                fallback={
                    <a
                        class={[styles.postmobile]}
                        aria-label="Login"
                        href={paths({dialog: "signin"})}          
                        replace
                    >
                        <UnlockIcon />
                    </a>
                }
            >
                <button
                    class={styles.postmobile}
                    aria-label="New post">
                    <i>+</i>
                </button>
            </ShowWhenAuthed>
            <a href="test"> <HandshakeIcon /> Squads</a>
            <a href="test"> <User2Icon /> Profile</a>
        </nav>
    )
}