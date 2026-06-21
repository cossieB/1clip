import { createFileRoute, Outlet, redirect } from '@tanstack/solid-router'
import { createServerFn } from '@tanstack/solid-start'
import { createEffect, Show } from 'solid-js'
import z from 'zod'
import { authClient } from '~/auth/authClient'
import { NavTabs } from '~/components/NavTabs/NavTabs'
import { useToastContext } from '~/hooks/useToastContext'
import { getCurrentUser } from '~/serverFn/auth'

const getSessionFn = createServerFn()
    .validator((str: string) => str)
    .handler(async ({ data }) => {
        const user = await getCurrentUser()
        if (!user) throw redirect({ to: "/auth/signin", replace: true, search: { redirect: data }, })
    })

export const Route = createFileRoute('/_pub/settings')({
    component: RouteComponent,
    headers: () => ({
        "Cache-Control": "max-age=3600, private"
    }),
    validateSearch: z.object({error: z.string().optional()}),
    loader: ({ location }) => getSessionFn({ data: location.href })
})

function RouteComponent() {
    const session = authClient.useSession();
    const {addToast} = useToastContext()
    const isUnverified = () => {
        const data = session().data
        if (!data) return false
        return !data.user.emailVerified
    }

    const search = Route.useSearch()

    return (
        <div class={"page"}>
            <Show when={isUnverified()}>
                <aside
                    style={{ "background-color": "red", padding: "0.5rem 1rem" }}
                >
                    {search().error == "token_expired" ? "That link has expired. " : "Your account is unverified. Check your email for the verification link. "}        
                    Click{" "}
                    <button onclick={async (e) => {
                        await authClient.sendVerificationEmail({
                            email: session().data!.user.email,
                            callbackURL: "/settings/profile"
                        }, {
                            onRequest() {
                                e.currentTarget.disabled = true;
                            },
                            onError({error}) {
                                addToast({text: error.message, type: "error"})
                            },
                            onResponse() {
                                e.currentTarget.disabled = false
                            },
                            onSuccess() {
                                addToast({text: "Check your mail for the link", type: "info"})
                            }
                        });
                    }}>
                        HERE
                    </button> to resend the email.
                </aside>
            </Show>
            <NavTabs
                tabs={[{
                    label: "Profile",
                    to: "/settings/profile"
                }, {
                    label: "Security",
                    to: "/settings/security"
                }]}
            />
            <Outlet />
        </div>
    )
}