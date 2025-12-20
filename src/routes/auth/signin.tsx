import { createFileRoute, Link, useNavigate } from '@tanstack/solid-router'
import { createStore } from 'solid-js/store'
import { Form } from '~/components/Forms/Form'
import { FormProvider } from '~/components/Forms/FormContext'
import { useToastContext } from '~/hooks/useToastContext'
import { authClient } from '~/utils/authClient'

export const Route = createFileRoute('/auth/signin')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const [input, setInput] = createStore({
        username: "",
        password: ""
    })
    const { addToast } = useToastContext()
    
    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        await authClient.signIn.username({
            username: input.username,
            password: input.password
        }, {
            onError(context) {
                addToast({
                    text: context.error.message,
                    type: "error"
                })
            },
            onSuccess() {
                navigate({ to: "/profile" })
            }
        })
    }

    return (
        <div class='page flexCenter'>
            <FormProvider>
                <Form disabled={!input.username || !input.password} onSubmit={handleSubmit}>
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
