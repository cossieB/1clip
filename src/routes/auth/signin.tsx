import { createFileRoute, Link, useNavigate } from '@tanstack/solid-router'
import { createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import z from 'zod'
import { Form } from '~/components/Forms/Form'
import { FormProvider } from '~/components/Forms/FormContext'
import { useToastContext } from '~/hooks/useToastContext'
import { authClient } from '~/auth/authClient'

export const Route = createFileRoute('/auth/signin')({
    component: RouteComponent,
    validateSearch: z.object({
        redirect: z.string().optional()
    }),
})

function RouteComponent() {
    const search = Route.useSearch()
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = createSignal(false)
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
            onSuccess() {
                navigate({ to: search()?.redirect ?? "/settings/profile" })
            }
        })
    }

    return (
        <div class='page flexCenter'>
            <FormProvider>
                <Form
                    isPending={isSubmitting()}
                    disabled={!input.username || !input.password}
                    onSubmit={handleSubmit}
                >
                    <h1>Login</h1>
                    <aside>
                        Don't have an account? <Link to='/auth/signup'>Click here to register</Link>
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
                </Form>
            </FormProvider>
        </div>
    )
}
