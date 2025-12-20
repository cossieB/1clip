import { useContext } from "solid-js";
import { ToastContext } from "~/components/Toast/ToastProvider";

export function useToastContext() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error("Component should be a descendent of ToastProvider")
    return ctx
}