import { createFileRoute, Link, useNavigate } from '@tanstack/solid-router'
import { createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Form } from '~/components/Forms/Form'
import { useToastContext } from '~/hooks/useToastContext'

import { authClient } from '~/auth/authClient'

export const Route = createFileRoute('/auth/signup')({
    component: RouteComponent,
})

function RouteComponent() {
    let btn!: HTMLButtonElement
    const [input, setInput] = createStore({
        email: "",
        password: "",
        confirmPassword: "",
        username: ""
    })
    const [submitting, setSubmitting] = createSignal(false)
    const { addToast } = useToastContext()
    const navigate = useNavigate()
    const emptyInput = () => Object.values(input).some(val => !val)

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        setSubmitting(true)
        await authClient.signUp.email({
            ...input,
            name: input.username
        }, {
            onError(context) {
                addToast({ type: "error", text: context.error.message })
                setSubmitting(false)
            },
            onSuccess() {
                addToast({
                    type: "info",
                    text: "Successfully created your account. Click the link in your email to verify your account",
                    autoFades: false
                })
                navigate({ to: "/settings/profile" })
            }
        })
    }

    return (
        <div class="page flexCenter">
            <Form
                disabled={emptyInput()}
                onSubmit={handleSubmit}
                isPending={submitting()}
            >
                <h1>Register</h1>
                <aside>
                    Already have an account? <Link to='/auth/signin'>Click here to login</Link>
                </aside>
                <Form.Input<typeof input>
                    field="email"
                    setter={val => setInput('email', val)}
                    value={input.email}
                    validator={val => {
                        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(val))
                            return ["Invalid Email"]
                        else return []
                    }}
                />
                <Form.Input<typeof input>
                    field="username"
                    setter={val => setInput('username', val)}
                    value={input.username}
                    validator={val => {
                        const errs: string[] = []
                        if (val.length < 3 || val.length > 15)
                            errs.push("Username has to be between 3 and 15 characters")
                        if (/\W/.test(val))
                            errs.push("Username may only contain letters, numbers and underscores")
                        if (/^[^a-zA-Z]/.test(val))
                            errs.push("Username must start with a letter")
                        return errs
                    }}
                    maxLength={15}
                />
                <Form.Input<typeof input>
                    field='password'
                    setter={val => setInput('password', val)}
                    value={input.password}
                    validator={val => {
                        if (val.length < 8) return ["Password has to be at least 8 characters"]
                        else return []
                    }}
                    type='password'
                />
                <Form.Input<typeof input>
                    field='confirmPassword'
                    setter={val => setInput('confirmPassword', val)}
                    value={input.confirmPassword}
                    validator={val => {
                        if (val != input.password) return ["Passwords do not match"]
                        else return []
                    }}
                    type='password'
                />

            </Form>
            <button class='cutout' ref={btn} popoverTarget='autoPopover' hidden />
        </div>
    )
}
