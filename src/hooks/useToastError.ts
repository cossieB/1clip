import { useContext } from "solid-js";
import { ToastContext } from "~/components/Toast/ToastProvider";

export function useToastError() {
    const { addToast } = useContext(ToastContext)
    const toastError = (error: unknown) => addToast({
            text: error instanceof Error && error.message
                ? error.message
                : "Something went wrong. Please try again later.",
            type: "error",
        })
    return toastError
}