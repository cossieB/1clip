import { PathEnd, DefaultSearchTypes } from "@solidjs/router";
import { Loading, Show } from "solid-js";
import { session } from "~/features/auth/authApi";

export function EditInfoBtn(props: {href: PathEnd<DefaultSearchTypes>}) {
    return (
        <Loading>
            <Show when={session().data?.user.role == "admin"}>
                <a href={props.href} class="button ghost">Edit</a>
            </Show>
        </Loading>
    )
}