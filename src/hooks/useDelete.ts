import { useNavigate } from "@solidjs/router";
import { action, useContext } from "solid-js";
import { ToastContext } from "~/components/Toast/ToastProvider";

export function useDelete(
    deleteFn: () => Promise<unknown>
) {
    const navigate = useNavigate()
    const { addToast } = useContext(ToastContext);

    const deletePost = action(function* () {
        try {
            yield deleteFn()
            navigate("/")
        }
        catch (error) {
            addToast({
                text: error instanceof Error && error.message
                    ? error.message
                    : "Something went wrong. Please try again later.",
                type: "error"
            })
        }
    })

    return { deletePost }
}