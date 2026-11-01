import styles from "./Searchbar.module.css"

export function SearchBar() {
    return (
        <div class={[styles.search]}>
            <input class={["cutout"]} style={{ "--bevel": "0.5rem" }} type="search" placeholder="Search squads, posts, games" />
        </div>
    )
}
