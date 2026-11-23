import { createMemo } from "solid-js"
import { SignupForm } from "../components/SignupForm"
import { ensureUnauthed } from "../authApi"
import { SiteTitle } from "~/components/CustomSiteTitle"

export function SignupRoute() {
    createMemo(() => ensureUnauthed(), {deferStream: true})

    return (
        <div class="card">
            <SiteTitle>Signup</SiteTitle>
            <h2>Signup</h2>
            <SignupForm />
        </div>
    )
}