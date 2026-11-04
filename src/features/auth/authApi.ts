import { action, affects, createMemo, createOptimistic, createStore, refresh, useContext } from "solid-js";
import { authClient } from "./authClient";
import { ToastContext } from "~/components/Toast/ToastProvider";
import { ensureUnauthed } from "./hooks/useEnsureUnauthed";

export const session = createMemo(() => authClient.getSession(), { ssrSource: "client" })

export function useSignUp() {
    ensureUnauthed();
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
    ensureUnauthed()
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
    })
    return { isSubmitting, signin, input, setInput }
}

export function useLogout() {
    const { addToast } = useContext(ToastContext)
    const logout = action(async function*() {
        affects(session)
        const {error} = await authClient.signOut();
        yield;
        if (error) return addToast({
            text: error.message ?? "Something went wrong",
            type: "error"
        })    
        refresh(session)    
    })
    return logout
}