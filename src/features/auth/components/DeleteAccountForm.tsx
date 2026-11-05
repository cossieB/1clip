import { createSignal, createUniqueId, useContext } from "solid-js";
import styles from "~/components/Popover/Dialog.module.css"
import { XIcon } from "@lucide/solid";
import { TextField } from "~/components/Forms/Textfield";
import { authClient } from "../authClient";
import { ToastContext } from "~/components/Toast/ToastProvider";

export function DeleteAccountForm() {

    const { addToast } = useContext(ToastContext)
    const titleId = createUniqueId();
    const [password, setPassword] = createSignal("")
    const [isPending, setIsPending] = createSignal(false)

    function deleteAccount(e: SubmitEvent) {
        e.preventDefault()
        setIsPending(true)
        authClient.deleteUser({
            password: password(),
        }, {
            onError({ error }) {
                addToast({ text: error.message, type: "error" })
                setIsPending(false)
            },
            onSuccess() {
                addToast({
                    text: "Click the link in your email to confirm your account deletion",
                    type: "info"
                })
            },
        })
    }

    return (
        <dialog
            class={[styles.dialog, "cutout"]}
            aria-labelledby={titleId}
            onClose={() => setPassword("")}
            id="del-account-dialog"
            style={{ "--accent": "var(--danger)" }}
        >
            <div class={styles.dialogPanel}>
                <header class={styles.dialogHeader}>
                    <h2 id={titleId}>Delete Account</h2>
                    <button
                        class={["ghost", styles.dialogClose]}
                        aria-label="Close dialog"
                        commandfor={"del-account-dialog"}
                        command="close"
                        type="button"
                    >
                        <XIcon />
                    </button>
                </header>
                <div class={styles.dialogBody}>
                    <form class="form" onSubmit={deleteAccount}>
                        <span>This is irreversible. All your posts and data will be deleted forever. Enter your password to confirm</span>
                        <TextField
                            label="Password"
                            onInput={val => setPassword(val)}
                            value={password()}
                            required
                            minlength={8}
                            type="password"
                        />
                        <button disabled={password().length < 8 || isPending()} class="danger" type="submit">Delete</button>
                    </form>
                </div>
            </div>
        </dialog>
    )
}