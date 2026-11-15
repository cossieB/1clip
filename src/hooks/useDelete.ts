import { useNavigate } from "@solidjs/router";
import { action } from "solid-js";
import { useToastError } from "./useToastError";

export function useDelete(
    deleteFn: () => Promise<unknown>
) {
    const navigate = useNavigate()
    const toastError = useToastError()

    const deletePost = action(function* () {
        try {
            yield deleteFn()
            navigate("/")
        }
        catch (error) {
            toastError(error)
        }
    })

    return { deletePost }
}