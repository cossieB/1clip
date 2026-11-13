import { createMemo, For, Loading, Match, ParentProps, Show, Switch } from "solid-js";
import { getUser } from "../userApi";
import { useParams } from "@solidjs/router";
import { paths } from "~/router";
import NotFound from "~/routes/[...404]";
import { AwaitedReturn } from "~/lib/utilityTypes";
import styles from "./user[id].module.css"
import { mediaSrc } from "~/utils/mediaSrc";
import { session } from "~/features/auth/authApi";
import { NavTabs } from "~/NavTabs/NavTabs";

export function UserIdLayout(props: ParentProps) {
    const params = useParams(paths.users)
    const user = createMemo(() => getUser({ username: params.username }))

    return (
        <Loading>
            <Show when={user()} fallback={<NotFound message="That user has spawned in yet" />}>

                {user =>
                    <>
                        <Page user={user()} />
                        <NavTabs
                            tabs={[{
                                href: paths.users(params.username).posts(),
                                label: "Clips"
                            }, {
                                href: paths.users(params.username).squads(),
                                label: "Squads"
                            }]}
                        />
                        {props.children}
                    </>
                }

            </Show>
        </Loading>
    )
}

function Page(props: { user: NonNullable<AwaitedReturn<typeof getUser>> }) {
    return (
        <div class={styles.container}>
            <div class={styles.hero} >
                <img class={styles.banner} src={mediaSrc(props.user.banner)} alt="" />
            </div>
            <header class={styles.header}>
                <img src={mediaSrc(props.user.image)} alt="" />
                <div class={styles.names}>
                    <h2> {props.user.displayName} </h2>
                    <span> @{props.user.displayUsername} </span>
                </div>
                <div class={styles.actions}>
                    <Loading>

                    <Switch>
                        <Match when={session().data?.user.id === props.user.id}>
                            <a class="button ghost" href={paths.profile()}>Edit Profile</a>
                        </Match>
                        <Match when={session().data?.user.id}>
                            <button>Follow</button>
                        </Match>
                    </Switch>
                    </Loading>
                </div>
            </header>
            <div class={["card", styles.bio]}>
                <label >About</label>
                <p>{props.user.bio}</p>
                <div>
                    <aside> Joined · {new Intl.DateTimeFormat("en-za", { month: "long", day: "numeric", year: "numeric" }).format(props.user.joined)} </aside>
                    <Show when={props.user.location}>
                        <aside>Location · {props.user.location}</aside>
                    </Show>
                    <Show when={props.user.dob}>
                        <aside>Born · {props.user.dob} </aside>
                    </Show>
                </div>
                <div class={styles.socials}>
                    <For each={props.user.links}>
                        {link => {
                            const url = new URL(link);
                            const display = `${url.host}${url.pathname}`
                            return <a href={link}> {display} </a>
                        }}
                    </For>
                </div>
            </div>
        </div>
    )
}

