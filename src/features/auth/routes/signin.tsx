import { createMemo } from "solid-js";
import { ensureUnauthed } from "../authApi";
import { LoginForm } from "../components/LoginForm";
import { SiteTitle } from "~/components/CustomSiteTitle";

export function SigninRoute() {
    createMemo(() => ensureUnauthed(), {deferStream: true})

    return (
        <div class="card">
            <SiteTitle>Signin</SiteTitle>
            <h2>Sign In</h2>
            <LoginForm />
        </div>
    )
}