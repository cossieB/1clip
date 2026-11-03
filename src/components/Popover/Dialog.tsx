import { createEffect, createUniqueId, Match, Show, Switch, type ParentProps } from "solid-js";
import styles from "./Dialog.module.css"
import { XIcon } from "@lucide/solid";
import { useSearchParams } from "@solidjs/router";
import { paths } from "~/router";
import { LoginForm } from "~/features/auth/components/LoginForm";
import SignupForm from "~/routes/auth/signup";

export function Dialog() {
    let dialog!: HTMLDialogElement;
    const titleId = createUniqueId();
    const [search, setSearch] = useSearchParams(paths)

    const title = () => {
        switch (search.dialog) {
            case "signin":
                return "Log In"
            case "signup":
                return "Sign Up"
        }
    }

    createEffect(() => search.dialog, d => {
        if (d)
            dialog.showModal()
        else
            dialog.close()
    })

    return (
        <dialog
            ref={(el) => (dialog = el)}
            class={[styles.dialog, "cutout"]}
            aria-labelledby={titleId}
            id="app-dialog"
            onClose={() => setSearch({dialog: undefined}, {replace: true})}
        >
            <div class={styles.dialogPanel}>
                <header class={styles.dialogHeader}>
                    <Show when={title()}>
                        <h2 id={titleId}>{title()}</h2>
                    </Show>
                    <button
                        class={["ghost", styles.dialogClose]}
                        aria-label="Close dialog"
                        commandfor={"app-dialog"}
                        command="close"
                        type="button"
                    >
                        <XIcon />
                    </button>
                </header>
                <div class={styles.dialogBody}>
                    <Switch>
                        <Match when={search.dialog == "signin"}>
                            <LoginForm />
                        </Match>
                        <Match when={search.dialog == "signup"}>
                            <SignupForm />
                        </Match>
                    </Switch>
                </div>
            </div>
        </dialog>
    );
}