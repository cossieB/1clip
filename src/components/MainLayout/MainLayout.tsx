import { createSignal, onMount, type JSXElement } from "solid-js";
import styles from "./MainLayout.module.css"
import { Nav } from "./Nav";
import { SearchBar } from "./Searchbar";

export function MainLayout(props: { children: JSXElement }) {
    const [showNav, setShowNav] = createSignal(false)
    const toggleNav = () => setShowNav(prev => !prev);
    onMount(() => {
        if (window.innerWidth >= 768) setShowNav(true)
    })
    return (
        <div id="gl" class={styles.root} classList={{ [styles.navOpen]: showNav() }}>
            <Nav toggleNav={toggleNav} />
            <SearchBar />
            <main class={styles.main}>
                {props.children}
            </main>
        </div>
    )
}