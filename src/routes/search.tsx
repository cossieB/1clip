import { useNavigate, useSearchParams } from "@solidjs/router";
import { JSXElement } from "solid-js";
import { NavTabs } from "~/components/NavTabs/NavTabs";
import { SearchBar } from "~/components/Search/Searchbar";

export default function SearchLayout(props: { children: JSXElement }) {
    const [search, setSearch] = useSearchParams()

    const s = () => Array.isArray(search.s) ? search.s[0] : search.s
    return (
        <div>
            <SearchBar
                initialValue={s()}
                onSearch={s => setSearch({s})}
            />
            <NavTabs
                tabs={[{
                    label: "Posts",
                    href: "/search/posts"
                }, {
                    label: "Games",
                    href: "/search/games"
                }]}
            />
            {props.children}
        </div>
    )
}