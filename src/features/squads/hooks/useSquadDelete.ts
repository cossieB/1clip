import { action, createSignal } from "solid-js"
import { deleteSquadFn } from "../squadsApi"
import { useToastError } from "~/hooks/useToastError"

export function useSquadDelete(squadId: number, onDelete: () => void) {
    const toastError = useToastError()
    const [deleting, setDeleting] = createSignal(false)
    
    const deleteAction = action(function* () {
        setDeleting(true)
        try {
            yield deleteSquadFn(squadId)
            onDelete()
        }
        catch (error) {
            toastError(error)
        }
    })
    return {deleteAction, deleting}
}