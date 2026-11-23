import { action, affects, createMemo, createOptimistic, createStore, refresh, useContext } from "solid-js";
import { authClient } from "./authClient";
import { ToastContext } from "~/components/Toast/ToastProvider";
import { useEnsureUnauthed } from "./hooks/useEnsureUnauthed";
import { revalidate, useNavigate, useSearchParams } from "@solidjs/router";
import { getProfileFn } from "../users/userApi";
import { query } from '@solidjs/router'
import { redirect, respond } from '@solidjs/web'
import { paths } from '~/router'
import { getCurrentUser } from "./serverFn";
import { getRequestEvent } from "@solidjs/web";

export const session = createMemo(() => authClient.getSession(), { ssrSource: "client" })

export function useSignUp() {
    useEnsureUnauthed();
    const { addToast } = useContext(ToastContext)
    const [input, setInput] = createStore({
        email: "",
        username: "",
        password: "",
        confirmPassword: ""
    })
    const [isSubmitting, setIsSubmitting] = createOptimistic(false)

    const signup = action(async function* () {
        affects(session)
        setIsSubmitting(true);

        const { error } = await authClient.signUp.email({
            username: input.username,
            email: input.email,
            name: input.username,
            password: input.password
        })
        yield;

        if (error) return addToast({
            text: error.message ?? "Something went wrong",
            type: "error"
        })
        yield refresh(session)
    })

    return { isSubmitting, signup, input, setInput }
}

export function useSignIn() {
    useEnsureUnauthed()
    const navigate = useNavigate()
    const [search] = useSearchParams(paths.auth.signin)
    const { addToast } = useContext(ToastContext)
    const [input, setInput] = createStore({
        username: "",
        password: "",
    })
    const [isSubmitting, setIsSubmitting] = createOptimistic(false)
    const signin = action(async function* () {
        affects(session)
        setIsSubmitting(true);
        const { error } = await authClient.signIn.username({
            username: input.username,
            password: input.password
        })
        yield;
        if (error) return addToast({
            text: error.message ?? "Something went wrong",
            type: "error"
        })
        yield refresh(session)
    if (search.redirect) navigate(search.redirect)
        
    })
    return { isSubmitting, signin, input, setInput }
}

export function useLogout() {
    const navigate = useNavigate()
    const { addToast } = useContext(ToastContext)
    const logout = action(async function*() {
        affects(session)
        const {error} = await authClient.signOut();
        yield;
        if (error) return addToast({
            text: error.message ?? "Something went wrong",
            type: "error"
        })    
        navigate(paths())
        yield revalidate(ensureAuthOrRedirect.key)
        yield refresh(session)    
    })
    return logout
}

export async function ensureAuthed() {
    'use server'
    const userSession = await getCurrentUser()
    if (!userSession) throw respond(new Error("Please login first"), { status: 401 })
    return userSession
}

export async function ensureVerified() {
    'use server'
    const userSession = await ensureAuthed()
    if (!userSession.user.emailVerified) throw respond(new Error("Please verify your email first"), { status: 403 })
    return userSession
}

export async function ensureAdmin() {
    'use server'
    const userSession = await ensureAuthed()
    if (userSession.user.role !== "admin") throw respond(new Error("Forbidden"), { status: 403 })
    return userSession
}

export const ensureAuthOrRedirect = query(async () => {
    'use server'
    let to = "/"
    const requestUrl = getRequestEvent()?.request.url;
    if (requestUrl) {
        to = new URL(requestUrl).pathname
    }
    const userSession = await getCurrentUser()
    if (!userSession) return redirect(paths.auth.signin({redirect: to}))
    return userSession
}, "authcheck")

export const ensureAdminOrRedirect = query(async () => {
    'use server'
    const userSession = await getCurrentUser()
    if (!userSession || userSession.user.role.toLowerCase() !== "admin") return redirect(paths())
}, "admincheck")

export const ensureUnauthed = query(async () => {
    'use server'
    const userSession = await getCurrentUser()
    if (userSession) return redirect(paths())
}, "alreadyAuthed")