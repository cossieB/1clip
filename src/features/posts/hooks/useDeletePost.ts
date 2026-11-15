import { action, createSignal } from "solid-js"
import { deletePostFn } from "../postsApi"
import { useToastError } from "~/hooks/useToastError"

export function useDeletePost(postId: number, onDelete: () => void) {
        const toastError = useToastError()
    const [deleting, setDeleting] = createSignal(false)
    const deleteAction = action(function* () {
        setDeleting(true)
        try {
            yield deletePostFn(postId)
            onDelete()
        }
        catch (error) {
            toastError(error)
        }
    })

    return {deleteAction, deleting}
}