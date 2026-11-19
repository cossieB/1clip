import { BellIcon, MessageSquareMoreIcon, HandshakeIcon, HomeIcon, User2Icon, VideoIcon, UnlockIcon } from "@lucide/solid"
import styles from "./MainLayout.module.css"
import { ShowWhenAuthed } from "~/features/auth/components/ShowWhenAuthed"
import { paths } from "~/router"
import { NavNotifications } from "~/features/notifications/components/NavNotifications"
import { useSearchParams } from "@solidjs/router"

export function Nav() {
    return (
        <div class={styles.nav}>
            <a href="/" > <HomeIcon /> <span>Home</span></a>
            <a href={paths.posts()}> <VideoIcon /> <span>Clips</span></a>
            <a href={paths("squads")}> <HandshakeIcon /> <span>Squads</span> </a>
            <ShowWhenAuthed>
                {/* <a href="/test"> <MessageSquareMoreIcon /> <span>Messages</span><b class="badge ok">3</b></a> */}
                <NavNotifications />
                <a href={paths.profile()}> <User2Icon /> <span>Profile</span></a>
            </ShowWhenAuthed>
        </div>
    )
}

export function Tabbar() {
    const [, setSearch] = useSearchParams()
    return (
        <nav class={styles.tabbar} aria-label="Main">
            <a href="/" > <HomeIcon /> Home</a>
            <a href={paths.posts()}> <VideoIcon />Clips</a>
            <ShowWhenAuthed
                fallback={
                    <button
                        class={[styles.postmobile]}
                        aria-label="Login"
                        onClick={() => setSearch({ dialog: "signin" }, {replace: true})}                        
                    >
                        <UnlockIcon />
                    </button>
                }
            >
                <button
                    class={styles.postmobile}
                    aria-label="New post">
                    <i>+</i>
                </button>
            </ShowWhenAuthed>
            <a href={paths.squads}> <HandshakeIcon /> Squads</a>
            <a href={paths.profile()}> <User2Icon /> Profile</a>
        </nav>
    )
}

