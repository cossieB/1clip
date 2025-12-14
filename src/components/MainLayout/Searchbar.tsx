import { SearchIcon } from "lucide-solid";
import styles from "./MainLayout.module.css"

export function SearchBar() {
    return (
        <div class={styles.search}>
            <div>
                <input type="search" />
                <button>
                    <SearchIcon />
                </button>
            </div>
        </div>
    )
}