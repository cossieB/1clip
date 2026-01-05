import { createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { authClient } from '~/auth/authClient'
import { Form } from '~/components/Forms/Form'
import { useToastContext } from '~/hooks/useToastContext'
import styles from "./ProfilePage.module.css"
import { useNavigate } from '@tanstack/solid-router'
import { ConfirmPopover, ConfirmPopoverWithButton } from '~/components/Popover/Popover'

export function SecurityPage() {
    const { addToast } = useToastContext()
    const [isPending, setIsPending] = createSignal(false)
    const session = authClient.useSession()
    const navigate = useNavigate()

    const [input, setInput] = createStore({
        email: "",
        username: "",
        currentPassword: "",
        newPassword: "",
        challengeAnswer: ""
    })

    async function changeEmail(e: SubmitEvent) {
        e.preventDefault()
        setIsPending(true)
        authClient.changeEmail({ newEmail: input.email }, {
            onError({ error }) {
                addToast({ text: error.message, type: "error", autoFades: false })
            },
            onSuccess() {
                addToast({ text: "Email successfully changed", type: "info" })
            },
            onResponse() {
                setIsPending(false)
            }
        })
    }

    async function changePassword(e: SubmitEvent) {
        e.preventDefault()
        setIsPending(true)
        authClient.changePassword({ currentPassword: input.currentPassword, newPassword: input.newPassword }, {
            onError({ error }) {
                addToast({ text: error.message, type: "error", autoFades: false })
            },
            onSuccess() {
                addToast({ text: "Password successfully changed", type: "info" })
            },
            onResponse() {
                setIsPending(false)
            }
        })
    }

    async function changeUsername(e: SubmitEvent) {
        e.preventDefault()
        setIsPending(true)
        authClient.updateUser({ username: input.username }, {
            onError({ error, }) {
                addToast({ text: error.message, type: "error", autoFades: false })
            },
            onSuccess() {
                addToast({ text: "Username successfully changed", type: "info" })
            },
            onResponse() {
                setIsPending(false)
            }
        })
    }

    function deleteAccount() {
        setIsPending(true)
        authClient.deleteUser({
            password: input.challengeAnswer,
        }, {
            onError({ error }) {
                addToast({ text: error.message, type: "error" })
            },
            onSuccess() {
                addToast({
                    text: "Click the link in your email to confirm your account deletion",
                    type: "info"
                })
            },
            onResponse() {
                setIsPending(false)
            }
        })
    }

    return (
        <div class={`${styles.profile} flexCenter`}>
            <Form
                disabled={!input.email}
                isPending={isPending()}
                onSubmit={changeEmail}
            >
                <h2>Change Email</h2>
                <Form.Input<typeof input>
                    field="email"
                    setter={val => setInput({ email: val })}
                    value={input.email}
                    validator={val => {
                        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(val))
                            return ["Invalid Email"]
                        else return []
                    }}
                />
            </Form>
            <br />

            <Form
                disabled={!input.currentPassword || input.newPassword.length < 8}
                isPending={isPending()}
                onSubmit={changePassword}
            >
                <h2>Change Password</h2>
                <Form.Input<typeof input>
                    field="currentPassword"
                    setter={val => setInput({ currentPassword: val })}
                    value={input.currentPassword}
                    label='Current Password'
                    type='password'
                />
                <Form.Input<typeof input>
                    field="newPassword"
                    setter={val => setInput({ newPassword: val })}
                    value={input.newPassword}
                    label='New Password'
                    validator={val => {
                        if (val.length < 8) return ["Password has to be at least 8 characters"]
                        else return []
                    }}
                    type='password'
                />
            </Form>
            <br />

            <Form
                disabled={!input.username}
                isPending={isPending()}
                onSubmit={changeUsername}
            >
                <h2>Change Username</h2>
                <Form.Input<typeof input>
                    field="username"
                    setter={val => setInput({ username: val })}
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
            </Form>

            <ConfirmPopoverWithButton
                popover={{
                    text: "This is irreversible. All your posts and data will be deleted forever. Enter your password to confirm",
                    setChallengeAnswer: val => setInput({ challengeAnswer: val }),
                    challengeAnswer: input.challengeAnswer,
                    onConfirm: deleteAccount,
                    type: 'password',
                    label: 'Password',
                    id: 'del-account-warn',
                }}
                button={{
                    class: styles.dangerBtn,
                    children: "Delete Account"
                }}
            />

        </div>
    )
}