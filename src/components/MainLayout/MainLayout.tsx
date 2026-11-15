import { type ParentProps } from "solid-js";
import styles from "./MainLayout.module.css"
import { PlusIcon, UnlockIcon } from "@lucide/solid"
import { Nav, Tabbar } from "./Nav";
import { UsersOnline } from "./FriendsOnline";
import { Trending } from "./Trending";
import { UserNavItem } from "~/features/auth/components/UserNavItem";
import { SearchBar } from "~/features/search/components/Searchbar";
import { ShowWhenAuthed } from "~/features/auth/components/ShowWhenAuthed";
import { Dialog } from "~/components/Popover/Dialog";
import { paths } from "~/router";
import { VerificationReminder } from "./VerificationReminder";

export default function MainLayout(props: ParentProps) {

    return (
        <div class={styles.shell}>
            {/* <!-- LEFT RAIL --> */}
            <nav class={styles.rail} aria-label="Main">
                <div class={styles.brand}>1Clip</div>
                <Nav />
                <ShowWhenAuthed
                    fallback={
                        <a
                            class={["button", "primary", styles.postbtn]}
                            href={paths({ dialog: "signin" },)}
                            replace
                        >
                            <UnlockIcon />
                            <span>Login</span>
                        </a>
                    }
                >
                    <a class={["button primary", styles.postbtn]} href={paths.posts.create()}>
                        <PlusIcon />
                        <span>Make A Post</span>
                    </a>
                </ShowWhenAuthed>
                <UserNavItem />
            </nav>

            {/* <!-- CENTER FEED --> */}
            <VerificationReminder />
            <div class={styles.main}>

            <SearchBar />
            <main >
                {props.children}
            </main>
            <footer class={styles.creds} >
                <hr />
                Developed by
                <a target="_blank" rel="noopener" href="https://cossie.dev">Buntu Cossie</a>
                <a target="_blank" rel="noopener" href="https://github.com/cossieB">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                    </svg>
                </a>
            </footer>
            </div>

            {/* <!-- RIGHT RAIL --> */}
            <aside class={styles.aside} aria-label="Activity">
                <UsersOnline />
                <Trending />
            </aside>
            <Tabbar />
            <Dialog />
        </div>
    )
}


