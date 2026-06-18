import { useSearchParams } from "@solidjs/router";
import { JSXElement, Show } from "solid-js";
import { authClient } from "~/auth/authClient";
import { NavTabs } from "~/components/NavTabs/NavTabs";
import { useToastContext } from "~/hooks/useToastContext";

export default function RouteComponent(props: {children: JSXElement}) {
    const session = authClient.useSession();
    const {addToast} = useToastContext()
    const isUnverified = () => {
        const data = session().data
        if (!data) return false
        return !data.user.emailVerified
    }
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