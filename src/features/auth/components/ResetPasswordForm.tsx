import { createSignal, createStore, useContext } from "solid-js"
import z from "zod"
import { TextField } from "~/components/Forms/Textfield"
import { paths } from "~/router"
import { authClient } from "../authClient"
import { ToastContext } from "~/components/Toast/ToastProvider"
import { useNavigate, useSearchParams } from "@solidjs/router"

export function RequestPasswordRequestForm() {
    const [email, setEmail] = createSignal("")
    const [submitting, setSubmitting] = createSignal(false)
    const { addToast } = useContext(ToastContext)

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        setSubmitting(true)
        authClient.requestPasswordReset({
            email: email(),
            redirectTo: "/?dialog=reset"
        }, {
            onError({ error }) {
                addToast({ text: error.message, type: "error" })
            },
            onSuccess({ data, response }) {
                addToast({ text: data.message, type: "info" })
            },
            onResponse() {
                setSubmitting(false)
            }
        })
    }

    return (
        <form class="form" onSubmit={handleSubmit}>
            <TextField
                label="Email"
                onInput={val => setEmail(val)}
                autofocus
                required
                type="email"
                schema={z.email()}
            />
            <div
                style={{
                    display: "flex",
                    "justify-content": "space-between",
                    "font-size": "small"
                }}
            >
                <a href={paths({ dialog: "signup" })} replace>Click here to create account</a>
                <a href={paths({ dialog: "signin" })} replace>Remembered password?</a>
            </div>
            <button disabled={!z.email().safeParse(email()).success || submitting()} type="submit">Reset</button>
        </form>
    )
}

export function ResetPasswordForm() {
    const { addToast } = useContext(ToastContext)
    const navigate = useNavigate()
    const [search] = useSearchParams(paths)
    const [input, setInput] = createStore({
        password: "",
        confirmPassword: "",
        isSubmitting: false
    })
    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        setInput(s => { s.isSubmitting = true })
        authClient.resetPassword({
            newPassword: input.password,
            token: search.token
        }, {
            onSuccess(context) {
                addToast({ text: "Password changed. You can log in now.", type: "info" })
                navigate(paths({ dialog: "signin" }))
            },
            onError({ error }) {
                addToast({ text: error.message, type: "error" });
                setInput(s => { s.isSubmitting = false })
            }
        })
    }
    return (
        <form class="form" onSubmit={handleSubmit} >
            <h2>Enter your new password</h2>
            <TextField
                label="Password"
                schema={z.string().min(8)}
                onChange={e => setInput(s => {
                    s.password = e.currentTarget.value
                })}
                type="password"
            />
            <TextField
                label="Confirm Password"
                schema={z.literal(input.password, "Passwords do not match")}
                type="password"
                onChange={e => setInput(s => {
                    s.confirmPassword = e.currentTarget.value
                })}
            />
            <button
                type="submit"
                disabled={
                    input.isSubmitting ||
                    input.password.length < 8 ||
                    input.password != input.confirmPassword
                }
            >
                Confirm
            </button>
        </form>
    )
}