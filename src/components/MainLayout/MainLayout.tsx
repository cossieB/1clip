import { type ParentProps } from "solid-js";
import styles from "./MainLayout.module.css"
import { PlusIcon, UnlockIcon } from "@lucide/solid"
import { Nav, Tabbar } from "./Nav";
import { PostComposer } from "~/features/posts/components/PostComposer";
import { FriendsOnline } from "./FriendsOnline";
import { Trending } from "./Trending";
import { UserNavItem } from "~/features/auth/components/UserNavItem";
import { SearchBar } from "./Searchbar";
import { ShowWhenAuthed } from "~/features/auth/components/ShowWhenAuthed";
import { Dialog } from "../Popover/Dialog";
import { paths } from "~/router";

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
                            href={paths({dialog: "signin"}, )}  
                            replace
                        >
                            <UnlockIcon />
                            <span>Login</span>
                        </a>
                    }
                >
                    <button class={["primary", styles.postbtn]}>
                        <PlusIcon />
                        <span>Post a clip</span>
                    </button>
                </ShowWhenAuthed>
                <UserNavItem />
            </nav>

            {/* <!-- CENTER FEED --> */}
            <main>
                <SearchBar />
                <PostComposer />
                {props.children}
            </main>

            {/* <!-- RIGHT RAIL --> */}
            <aside class={styles.aside} aria-label="Activity">
                <FriendsOnline />
                <Trending />
            </aside>
            <Tabbar />
            <Dialog />
        </div>
    )
}


