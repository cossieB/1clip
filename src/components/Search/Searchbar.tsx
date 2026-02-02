import { SearchIcon } from "lucide-solid";
import styles from "./Searchbar.module.css"
import { createSignal } from "solid-js";

type Props = {
    onSearch: (val: string) => void
    initialValue?: string
}

export function SearchBar(props: Props) {
    const [input, setInput] = createSignal(props.initialValue ?? "")
    return (
        <div class={styles.search}>
            <form
                onsubmit={e => {
                    e.preventDefault()
                    props.onSearch(input())
                }}
            >
                <div>
                    <input value={input()} oninput={e => setInput(e.currentTarget.value)} type="search" />
                    <button disabled={!input()} >
                        <SearchIcon />
                    </button>
                </div>
            </form>
        </div>
    )
}