import { createFileRoute, redirect, useLocation, useNavigate } from '@tanstack/solid-router'
import { Match, Show, Switch } from 'solid-js'
import { createStore } from 'solid-js/store'
import { authClient } from '~/auth/authClient'
import { Form } from '~/components/Forms/Form'
import { Passwords } from './-passes'
import z from 'zod'
import { useToastContext } from '~/hooks/useToastContext'

export const Route = createFileRoute('/_pub/auth/reset')({
    validateSearch: z.object({
        token: z.string().optional(),
        error: z.string().optional()
    }).optional(),
    component: RouteComponent,
})

function RouteComponent() {
    const location = useLocation()
    const { addToast } = useToastContext();
    const navigate = useNavigate()
    const [input, setInput] = createStore({
        password: "",
        confirmPassword: "",
        isSubmitting: false
    })
    return (
        <div class='flexCenter page'>
            <Show
                when={!!location().search.token}
                fallback={<Passwords />}
            >
                <Form
                    isPending={input.isSubmitting}
                    onSubmit={async e => {
                        e.preventDefault();
                        setInput({ isSubmitting: true })
                        authClient.resetPassword({
                            newPassword: input.password,
                            token: location().search.token
                        }, {
                            onSuccess(context) {
                                addToast({ text: "Password changed. You can log in now.", type: "info" })
                                navigate({to: "/auth/signin"})
                            },
                            onError({ error }) {
                                addToast({ text: error.message, type: "error" });
                                setInput({ isSubmitting: false })
                            }
                        })
                    }}
                >
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
            </Show>
        </div>
    )
}
