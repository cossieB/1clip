import { action, createOptimistic, createSignal } from "solid-js"
import { updateSquadFn } from "../squadsApi"
import { useToastError } from "~/hooks/useToastError"

export function useCloseSquad(squadId: number, isActive: () => boolean) {
    const toastError = useToastError()
    const [activeConfirmed, setActiveConfirmed] = createSignal(isActive)
    const [active, setActive] = createOptimistic(() => activeConfirmed())

    const close = action(function* () {

        try {
            setActive(false)
            yield updateSquadFn({
                squadId: squadId,
                isActive: false
            })
            setActiveConfirmed(false)
        } catch (error) {
            toastError(error)
        }
    })
    return { active, close }
}