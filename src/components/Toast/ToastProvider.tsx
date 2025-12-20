import { createContext, createEffect, on, type JSXElement } from "solid-js";
import { createStore } from "solid-js/store";
import { Optional } from "~/lib/utilityTypes";

export const ToastContext = createContext<ToastCtx>()

export type TToast = {
    text: string
    type: 'info' | 'error' | 'warning',
    autoFades: boolean
}

export function ToastProvider(props: {children: JSXElement}) {
    const [toasts, setToasts] = createStore<TToast[]>([])

    function addToast(toast: Optional<TToast, 'autoFades'>) {
        toast.autoFades ??= true
        setToasts(prev => [...prev, toast as TToast])
    }

    function removeToast(idx: number) {
        setToasts(prev => prev.filter((_, i) => i != idx))
    }

    function clearToasts() {
        setToasts([])
    }

    return (
        <ToastContext.Provider value={{addToast, removeToast, clearToasts, toasts}}>
            {props.children}
        </ToastContext.Provider>
    )
}

type ToastCtx = {
    addToast(toast: Optional<TToast, 'autoFades'>): void
    removeToast(i: number): void
    clearToasts(): void
    toasts: TToast[]
}