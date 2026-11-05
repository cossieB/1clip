import { createSignal, createStore, Loading, onSettled, refresh, useContext } from "solid-js";
import { authClient } from "../authClient";
import { ToastContext } from "~/components/Toast/ToastProvider";
import { Spinner } from "~/components/Loader/Spinner";
import { TextField } from "~/components/Forms/Textfield";
import z from "zod";
import { session } from "../authApi";
import { DeleteAccountForm } from "./DeleteAccountForm";


export default function SecurityPage() {
    const { addToast } = useContext(ToastContext)
    const [input, setInput] = createStore(() => ({
        email: session().data?.user.email ?? "",
        username: session().data?.user.displayUsername ?? "",
        currentPassword: "",
        newPassword: "",
        challengeAnswer: ""
    }))

    const [isPending, setIsPending] = createSignal(false)

    async function changeEmail(e: SubmitEvent) {
        e.preventDefault()
        setIsPending(true)
        authClient.changeEmail({ newEmail: input.email }, {
            onError({ error }) {
                addToast({ text: error.message, type: "error", autoFades: false })
            },
            onSuccess() {
                addToast({ text: "Check your email for the confirmation link", type: "info" })                
            },
            onResponse() {
                setIsPending(false)
            }
        })
    }

    async function changePassword(e: SubmitEvent) {
        e.preventDefault()
        setIsPending(true)
        authClient.changePassword({ currentPassword: input.currentPassword, newPassword: input.newPassword }, {
            onError({ error }) {
                addToast({ text: error.message, type: "error", autoFades: false })
            },
            onSuccess() {
                addToast({ text: "Password successfully changed", type: "info" })
                refresh(session)
            },
            onResponse() {
                setIsPending(false)
            }
        })
    }

    async function changeUsername(e: SubmitEvent) {
        e.preventDefault()
        setIsPending(true)
        authClient.updateUser({
            username: input.username.toLowerCase(),
            displayUsername: input.username
        }, {
            onError({ error, }) {
                addToast({ text: error.message, type: "error", autoFades: false })
            },
            onSuccess() {
                addToast({ text: "Username successfully changed", type: "info" })
                refresh(session)
            },
            onResponse() {
                setIsPending(false)
            }
        })
    }

    return (
        <Loading fallback={<Spinner />}>
            <form
                class="card cutout"
                style={{ "margin-bottom": "1rem" }}
                onSubmit={changeUsername}
            >
                <h2>Change Username</h2>
                <TextField
                    label="Username"
                    onChange={e => setInput(s => {
                        s.username = e.currentTarget.value
                    })}
                    value={input.username}
                />
                <button
                    class="secondary"
                    type="submit"
                    disabled={session().data?.user.displayUsername === input.username || isPending()}
                >
                    Submit
                </button>
            </form>
            <form
                class="card cutout"
                style={{ "margin-bottom": "1rem" }}
                onSubmit={changeEmail}
            >
                <h2>Change Email</h2>
                <TextField
                    label="Email"
                    schema={z.email().optional()}
                    type="email"
                    onChange={e => setInput(s => {
                        s.email = e.currentTarget.value
                    })}
                    value={input.email}
                />
                <button
                    disabled={
                        !z.email().safeParse(input.email).success
                        || isPending()
                        || session().data?.user.email.toLowerCase() === input.email.toLowerCase()
                    }
                    class="secondary"
                    type="submit"
                >
                    Submit
                </button>
            </form>
            <form
                class="card cutout"
                style={{ "margin-bottom": "1rem" }}
                onSubmit={changePassword}
            >
                <h2>Change Password</h2>
                <TextField
                    label="Current Password"
                    schema={z.string().min(8)}
                    type="password"
                    onChange={e => setInput(s => {
                        s.currentPassword = e.currentTarget.value
                    })}
                />
                <TextField
                    label="New Password"
                    schema={z.string().min(8)}
                    type="password"
                    onChange={e => setInput(s => {
                        s.newPassword = e.currentTarget.value
                    })}
                />
                <button
                    type="submit"
                    class="secondary"
                    disabled={input.currentPassword.length < 8 || input.newPassword.length < 8 || isPending()}
                >
                    Submit
                </button>
            </form>
            <button
                type="button"
                style={{
                    width: "100%",
                    "margin-bottom": "1rem",
                    "background-color": "var(--danger)"
                }}
                commandfor={"del-account-dialog"}
                command="show-modal"
            >
                Delete Account
            </button>
            <DeleteAccountForm />
        </Loading>
    )
}