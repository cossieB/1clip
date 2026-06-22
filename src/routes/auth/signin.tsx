import { A, revalidate, useLocation, useNavigate, useSearchParams } from "@solidjs/router"
import { useQueryClient } from "@tanstack/solid-query"
import { createSignal } from "solid-js"
import { createStore } from "solid-js/store"
import { authClient } from "~/auth/authClient"
import { Form } from "~/components/Forms/Form"
import { MySiteTitle } from "~/components/MySiteTitle"
import { useToastContext } from "~/hooks/useToastContext"
import { getActiveSession } from "~/services/authService"

export default function SigninRoute() {
    const [search] = useSearchParams()
    const redirect = () => Array.isArray(search.redirect) ? search.redirect[0] : search.redirect
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const queryClient = useQueryClient()

    const [input, setInput] = createStore({
        username: "",
        password: ""
    })
    const { addToast } = useToastContext()

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        setIsSubmitting(true)
        await authClient.signIn.username({
            username: input.username,
            password: input.password
        }, {
            onError(context) {
                addToast({
                    text: context.error.message,
                    type: "error"
                })
                setIsSubmitting(false)
            },
            async onSuccess() {
                await revalidate(getActiveSession.key)
                queryClient.clear()
                navigate(redirect() ?? "/settings/profile")
            }
        })
    }
    const location = useLocation()
    
    return (
        <div class='page flexCenter'>
            <MySiteTitle>Signin</MySiteTitle>
            <Form
                isPending={isSubmitting()}
                disabled={!input.username || !input.password}
                onSubmit={handleSubmit}
            >
                <h1>Login</h1>
                <aside>
                    Don't have an account? <A href={'/auth/signup' + location.search}>Click here to register</A>
                </aside>
                <Form.Input<typeof input>
                    field="username"
                    setter={val => setInput('username', val)}
                    value={input.username}
                    type="text"
                />
                <Form.Input<typeof input>
                    field="password"
                    setter={val => setInput('password', val)}
                    value={input.password}
                    type="password"
                />
                <aside>
                    Forgot your password? <A href='/auth/reset'>Click here to reset it</A>
                </aside>
            </Form>
        </div>
    )
}