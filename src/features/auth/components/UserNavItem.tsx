import { createMemo, isPending, Loading, onSettled, refresh, Show } from "solid-js"
import styles from "./UserNavItem.module.css"
import env from "virtual:solid-env/client"
import { HoldClickBtn } from "~/components/HoldClickBtn/HoldClickBtn"
import { CheckIcon } from "@lucide/solid"
import { session, useLogout } from "../authApi"

export function UserNavItem() {
    const src = createMemo(() => session().data ? `${env.VITE_STORAGE_DOMAIN}/${session().data!.user.image}` : undefined)

    return (
        <Loading>
            <Show
                when={session().data}
            >
                <button class={styles.me} type="button" data-s="on" popovertarget={styles.userStatus} >
                    <img class={styles.avatar} src={src() ?? "/q.png"} />
                    <div><b> {session().data?.user.displayUsername} </b><small>In lobby · Valorant</small></div>
                </button>
                <Status />
            </Show>
        </Loading>
    )
}

function Status() {
    const logout = useLogout()
    return (
        <ul id={styles.userStatus} popover class="cutout" >
            <li class="field">
                <label >Status</label>
                <div role="group" class="input">
                    <input 
                    type="text" 
                    placeholder="What you up to?" 
                    maxlength={20}
                    />
                    <button aria-label="Set your status" class="ghost" >
                        <CheckIcon size={16} />
                    </button>
                </div>
            </li>
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