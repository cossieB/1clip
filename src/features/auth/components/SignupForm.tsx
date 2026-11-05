import z from "zod"
import { TextField } from "~/components/Forms/Textfield"
import { paths } from "~/router"
import { session, useSignUp } from "../authApi"
import { isPending, Show } from "solid-js"
import { Spinner } from "~/components/Loader/Spinner"

const SignupSchema = z.object({
    email: z.email(),
    username: z.string().regex(/^[A-Za-z]\w{2,14}$/, "Username must start with a letter and be between 3 and 15 characters long, containing only letters, numbers, or underscores."),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
})
    .superRefine((data, ctx) => {
        if (data.password != data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                message: "Passwords do not match",
                path: ["confirmPassword"]
            })
        }
    })

export function SignupForm() {

    const { signup, isSubmitting, input, setInput } = useSignUp()

    const disabled = () => !SignupSchema.safeParse(input).success
    return (
        <form
            class="form"
            onSubmit={e => {
                e.preventDefault()
                signup()
            }}
        >
            <TextField
                label="Email"
                schema={SignupSchema.shape.email}
                onInput={val => setInput(s => { s.email = val })}
                autofocus
            />
            <TextField
                label="Username"
                schema={SignupSchema.shape.username}
                maxlength={15}
                onInput={val => setInput(s => { s.username = val })}
            />
            <TextField
                label="Password"
                schema={SignupSchema.shape.password}
                onInput={val => setInput(s => { s.password = val })}
                type="password"
            />
            <TextField
                label="Confirm Password"
                schema={z.literal(input.password, "Passwords do not match")}
                onInput={val => setInput(s => { s.confirmPassword = val })}
                type="password"
            />
            <div
                style={{
                    display: "flex",
                    "justify-content": "space-between",
                    "font-size": "small"
                }}
            >
                <a href={paths({ dialog: "signin" })} replace>Already have an account?</a>
            </div>
            <button
                class="primary"
                disabled={disabled() || isSubmitting() || isPending(session)}
                type="submit"
            >
                <Show when={isSubmitting()} fallback="Submit">
                    <Spinner size="small" />
                </Show>
            </button>
        </form>
    )
}