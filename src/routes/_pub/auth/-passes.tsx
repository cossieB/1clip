import { createSignal } from 'solid-js'
import { authClient } from '~/auth/authClient'
import { Form } from '~/components/Forms/Form'
import { useToastContext } from '~/hooks/useToastContext'

export function Passwords() {
    const [email, setEmail] = createSignal("");
    const [isSubmitting, setIsSubmitting] = createSignal(false)
    const { addToast } = useToastContext()

    return (
        <Form
            isPending={isSubmitting()}
            disabled={!email()}
            onSubmit={async (e) => {
                e.preventDefault()
                setIsSubmitting(true)
                authClient.requestPasswordReset({
                    email: email(),
                    redirectTo: "/auth/reset"
                }, {
                    onError({ error }) {
                        addToast({ text: error.message, type: "error" })
                    },
                    onSuccess({ data, response }) {
                        addToast({ text: data.message, type: "info" })
                    },
                    onResponse() {
                        setIsSubmitting(false)
                    }
                })
            }}
        >
            <Form.Input
                field={""}
                label='Email'
                setter={val => setEmail(val)}
                value={email()}
                validator={val => {
                    if ((!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(val))) return ["Invalid Email"]
                    return []
                }}
            />
        </Form>
    )
}