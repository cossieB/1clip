import { createMemo, Show } from "solid-js"
import { ensureUnauthed } from "../authApi"
import { SiteTitle } from "~/components/CustomSiteTitle"
import { RequestPasswordRequestForm, ResetPasswordForm } from "../components/ResetPasswordForm"
import { useSearchParams } from "@solidjs/router"
import { paths } from "~/router"

export function ResetPasswordRoute() {
    createMemo(() => ensureUnauthed(), { deferStream: true })
    const [search] = useSearchParams(paths.auth.reset)
    return (
        <div class="card">
            <SiteTitle>Reset Password</SiteTitle>
            <h2>Reset Password</h2>
            <Show
                when={search.token}
                fallback={<RequestPasswordRequestForm />}
            >
                <ResetPasswordForm />
            </Show>
        </div>
    )
}