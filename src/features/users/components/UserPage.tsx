import { CalendarPlus2Icon, CakeIcon, MapPinIcon } from "lucide-solid";
import { For, Show } from "solid-js";
import { HeroHeader } from "~/components/Hero/HeroHeader";
import { formatDate } from "~/lib/formatDate";
import { type getUserByUsernameFn } from "~/serverFn/users";
import { SITE_URL, STORAGE_DOMAIN } from "~/utils/env";
import styles from "./UserPage.module.css"
import { Link } from "@tanstack/solid-router";
import { validateUrl } from "~/lib/validateUrl";
import { getPostsFn } from "~/serverFn/posts";

type Props = {
    user: NonNullable<Awaited<ReturnType<typeof getUserByUsernameFn>>>
};

export function UserPage(props: Props) {
    return (
        <div>
            <HeroHeader
                banner={STORAGE_DOMAIN + props.user.banner}
                image={STORAGE_DOMAIN + props.user.image}
                label={props.user.displayName}
                viewTransitionName={'user' + props.user.username}
            />
            <div class={styles.about}>
                <div>
                    <div title="Joined" class={styles.misc}>
                        <CalendarPlus2Icon />
                        <span> {formatDate(props.user.joined)} </span>
                    </div>
                    <Show when={props.user.dob}>
                        <div title="Born" class={styles.misc}>
                            <CakeIcon />
                            <span>{props.user.dob}</span>
                        </div>
                    </Show>
                    <Show when={props.user.location}>
                        <div title="Location" class={styles.misc}>
                            <MapPinIcon />
                            <span>{props.user.location}</span>
                        </div>
                    </Show>
                </div>
                <div class='paras cutout'>
                    {props.user.bio}
                </div>
                <div class={styles.links}>
                    <ul>
                        <li>
                            <img src="/favicon.ico" alt="" />
                            <Link to="/users/$username" params={{ username: props.user.username! }}>
                                {`${SITE_URL}/users/${props.user.username}`}
                            </Link>
                        </li>
                        <For each={props.user.links}>
                            {link =>
                                <li>
                                    <img
                                        src={`${validateUrl(link)?.origin}/favicon.ico`}
                                        onerror={e => e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/8/84/Icons8-question-mark-52.png"}
                                    />
                                </li>
                            }
                        </For>
                    </ul>
                </div>
            </div>
        </div>
    )
}