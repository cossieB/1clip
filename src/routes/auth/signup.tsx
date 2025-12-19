import { createFileRoute, useNavigate } from '@tanstack/solid-router'
import { createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Popover } from '~/components/Popover/Popover'
import { Form } from '~/Forms/Form'
import { FormProvider } from '~/Forms/FormContext'
import { authClient } from '~/utils/authClient'

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
    const [submitError, setSubmitError] = createSignal("")
    const navigate = useNavigate()
    const emptyInput = () => Object.values(input).some(val => !val)
    return (
        <div class="page flexCenter">
            <FormProvider>
                <Form
                    disabled={emptyInput() || submitting()}
                    onSubmit={async e => {
                        e.preventDefault()
                        setSubmitting(true)
                        const { data, error } = await authClient.signUp.email({ ...input, name: input.username })
                        if (error) {
                            setSubmitError(error.message ?? "Something went wrong. Please try again later")
                            setSubmitting(false)
                            return btn.click()
                        }
                        if (data)
                            navigate("/profile")
                    }}
                >
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
            </FormProvider>
            <Popover>
                {submitError()}
            </Popover>
            <button class='cutout' ref={btn} popoverTarget='autoPopover' hidden />
        </div>
    )
}
