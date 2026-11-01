import { BellIcon, MessageSquareMoreIcon, HandshakeIcon, HomeIcon, User2Icon, VideoIcon } from "@lucide/solid"
import styles from "./MainLayout.module.css"

export function Nav() {
    return (
        <div class={styles.nav}>
            <a href="/" > <HomeIcon /> <span>Home</span></a>
            <a href="/test"> <VideoIcon /> <span>Clips</span></a>
            <a href="/test"> <HandshakeIcon /> <span>Find a squad</span> <b class="badge ok">12</b></a>
            <a href="/test"> <MessageSquareMoreIcon /> <span>Messages</span><b class="badge info">3</b></a>
            <a href="/test"> <BellIcon /> <span>Alerts</span></a>
            <a href="/test"> <User2Icon /> <span>Profile</span></a>
        </div>
    )
}

export function Tabbar() {
    return (
        <nav class={styles.tabbar} aria-label="Main">
            <a href="/" > <HomeIcon /> Home</a>
            <a href="test"> <VideoIcon />Clips</a>
            <a href="test" class={styles.postmobile} aria-label="New post"><i>+</i></a>
            <a href="test"> <HandshakeIcon /> Squads</a>
            <a href="test"> <User2Icon /> Profile</a>
        </nav>
    )
}