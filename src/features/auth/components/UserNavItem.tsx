import { action, createMemo, createOptimisticStore, isPending, Loading, refresh, Show } from "solid-js"
import styles from "./UserNavItem.module.css"
import env from "virtual:solid-env/client"
import { HoldClickBtn } from "~/components/HoldClickBtn/HoldClickBtn"
import { session, useLogout } from "../authApi"
import { SearchAutocomplete } from "~/components/SearchAutocomplete/SearchAutocomplete"
import { getGamesFn } from "~/features/games/gamesApi"
import { getStatusFn, setStatusFn } from "~/features/users/userApi"

type G = {
    gameId: number
    title: string
}

export function UserNavItem() {
    const src = createMemo(() => session().data ? `${env.VITE_STORAGE_DOMAIN}/${session().data!.user.image}` : undefined)
    const [status, setStatus] = createOptimisticStore<G>(() => getStatusFn(), {
        gameId: -1,
        title: "In Lobby"
    })

    const update = action(function* (game: G) {
        setStatus(s => game)
        yield setStatusFn(game)
        refresh(status)
    })

    return (
        <Loading>
            <Show when={session().data}           >
                <button class={styles.me} type="button" data-s="on" popovertarget={styles.userStatus} >
                    <img class={styles.avatar} src={src() ?? "/q.png"} />
                    <div><b> {session().data?.user.displayUsername} </b><small> {status.title} </small></div>
                </button>
                <Status
                    onUpdate={update}
                />
            </Show>
        </Loading>
    )
}

type Props = {
    onUpdate: (game: G) => void
}

function Status(props: Props) {
    const logout = useLogout()

    return (
        <ul id={styles.userStatus} popover class="cutout" >
            <SearchAutocomplete
                search={async str => {
                    return [{
                        title: "In Lobby",
                        gameId: -1,
                    }, ...await getGamesFn({ title: str })
                    ]
                }}
                label="What you playin?"
                getLabel={game => game.title}
                onSelect={props.onUpdate}
                onTop
                clearOnSelect
            />
            <li>
                <HoldClickBtn
                    action={logout}
                    label="Log Out"
                    variant="danger"
                    disabled={isPending(session)}
                />
            </li>
        </ul>
    )
}