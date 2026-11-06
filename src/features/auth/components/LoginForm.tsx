import { isPending } from "solid-js"
import { TextField } from "~/components/Forms/Textfield"
import { paths } from "~/router";
import { session, useSignIn } from "../authApi";

export function LoginForm() {

    const { input, setInput, isSubmitting, signin } = useSignIn()
    return (
        <form class="form" onSubmit={async e => {
            e.preventDefault()
            await signin()
        }} >
            <TextField
                label="Username"
                onInput={val => setInput(s => { s.username = val })}
                autofocus
                required
            />
            <TextField
                label="Password"
                type="password"
                onInput={val => setInput(s => { s.password = val })}
                required
            />
            <div
                style={{
                    display: "flex",
                    "justify-content": "space-between",
                    "font-size": "small"
                }}
            >
                <a href={paths({ dialog: "signup" })} replace>Click here to create account</a>
                <a href={paths({ dialog: "reset" })} replace>Forgot password?</a>
            </div>
            <button
                class="primary"
                disabled={!input.password || !input.username || isSubmitting() || isPending(session)}
                type="submit">
                Submit
            </button>
        </form>
    )
}