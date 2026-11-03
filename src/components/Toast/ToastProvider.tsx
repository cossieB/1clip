import { createContext, createEffect, type Element } from "solid-js";
import { createStore } from "solid-js";
import type { Optional } from "~/lib/utilityTypes";
import { ToastContainer } from "./Toast";

export const ToastContext = createContext<ToastCtx>()

export type TToast = {
    text: string
    type: 'info' | 'error' | 'warning',
    autoFades: boolean
}

export function ToastProvider(props: {children: Element}) {
    const [toasts, setToasts] = createStore<TToast[]>([])

    function addToast(toast: Optional<TToast, 'autoFades'>) {
        toast.autoFades ??= true
        setToasts(prev => {
            prev.push(toast as TToast)
        })
    }

    function removeToast(idx: number) {
        setToasts(s => {
            return s.filter((_, i) => i != idx)
        })
    }

    function clearToasts() {
        setToasts(() => [])
    }

    return (
        <ToastContext value={{addToast, removeToast, clearToasts, toasts}}>
            {props.children}
            <ToastContainer />
        </ToastContext>
    )
}

type ToastCtx = {
    addToast(toast: Optional<TToast, 'autoFades'>): void
    removeToast(i: number): void
    clearToasts(): void
    toasts: TToast[]
}