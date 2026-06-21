import { createAsync, Navigate, query, redirect, useSearchParams } from "@solidjs/router";
import { JSXElement, Show } from "solid-js";
import { getRequestEvent } from "solid-js/web";
import { authClient } from "~/auth/authClient";
import { NavTabs } from "~/components/NavTabs/NavTabs";
import { useToastContext } from "~/hooks/useToastContext";
import { HttpStatusCode } from "~/utils/statusCodes";

const getSession = query(async () => {
    'use server'
    const user = getRequestEvent()?.locals.user
    if (!user) throw redirect("/auth/signin", {
        status: HttpStatusCode.TEMPORARY_REDIRECT,
        headers: {
            "Cache-Control": "no-store, no-cache"
        }
    })
    return user
}, "u")

export default function RouteComponent(props: {children: JSXElement}) {
    const session = createAsync(() => getSession())
    const {addToast} = useToastContext()
    const isUnverified = () => session() && !session()?.emailVerified
    const [search, setSearch] = useSearchParams()
    
    return (
        <div class={"page"}>

            <Show when={isUnverified()}>
                <aside
                    style={{ "background-color": "red", padding: "0.5rem 1rem" }}
                >
                    {search.error == "token_expired" ? "That link has expired. " : "Your account is unverified. Check your email for the verification link. "}        
                    Click{" "}
                    <button onclick={async (e) => {
                        await authClient.sendVerificationEmail({
                            email: session()!.email,
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
                    href: "/settings/profile"
                }, {
                    label: "Security",
                    href: "/settings/security"
                }]}
            />
            {props.children}
        </div>
    )
}