import { createEffect, createMemo, createSignal, Show, useContext } from "solid-js";
import { session } from "~/features/auth/authApi";
import { authClient } from "~/features/auth/authClient";
import { ToastContext } from "../Toast/ToastProvider";
import styles from "./MainLayout.module.css"
import { useSearchParams } from "@solidjs/router";

export function VerificationReminder() {
    const { addToast } = useContext(ToastContext)
    const [search] = useSearchParams()
    const isUnverified = createMemo(() => !!session().data && !session().data!.user.emailVerified, {
        loadingValue: false
    })

    const [isPending, setIsPending] = createSignal(false)
    return (
        <Show when={isUnverified()}>
            <aside class={styles.verificationReminder}>
                {search.error == "token_expired" ? "That link has expired. " : "Your account is unverified. Check your email for the verification link. "}
                Click{" "}
                <button
                    class="ghost"
                    disabled={isPending()}
                    onClick={async (e) => {
                        await authClient.sendVerificationEmail({
                            email: session().data!.user.email
                        }, {
                            onRequest() {
                                setIsPending(true)
                            },
                            onError({ error }) {
                                addToast({ text: error.message, type: "error" })
                                setIsPending(false)
                            },
                            onSuccess() {
                                addToast({ text: "Check your mail for the link", type: "info" })
                            }
                        });
                    }}
                    >
                    HERE
                </button> to resend the email.
            </aside>
        </Show>
    )
}