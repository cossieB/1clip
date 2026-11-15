import { action, createOptimistic, createSignal } from "solid-js"
import { applyToSquadFn } from "../squadsApi"
import { useToastError } from "~/hooks/useToastError"

export function useApplyToSquad(squadId: number, hasApplied: () => boolean) {
    const toastError = useToastError()
    // ── Apply (confirmed state resets when the prop is refetched) ──
    const [appliedConfirmed, setAppliedConfirmed] = createSignal(hasApplied)
    const [applied, setApplied] = createOptimistic(() => appliedConfirmed())
    const [message, setMessage] = createSignal("")

    const apply = action(function* () {
        try {
            setApplied(true)
            yield applyToSquadFn({
                id: squadId,
                message: message()
            })
            setAppliedConfirmed(true)
        }
        catch (error) {
            toastError(error)
        }
    })

    return {applied, setMessage, apply, message}
}