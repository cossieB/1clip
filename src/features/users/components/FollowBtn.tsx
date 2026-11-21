// FollowBtn.tsx
import { Show, action, createOptimistic, createSignal, useContext } from "solid-js"
import styles from "./FollowBtn.module.css"
import { toggleFollowFn } from "../userApi"
import { ToastContext } from "~/components/Toast/ToastProvider"
import { useToastError } from "~/hooks/useToastError"

type FollowResult = {
    following: boolean
    followerCount: number
}

type Props = {
    targetUserId: string
    isFollowing: boolean
    /** Called after the server confirms, e.g. to update a follower count shown elsewhere. */
    onChange?: (result: FollowResult) => void
}

export function FollowBtn(props: Props) {
    const {addToast} = useContext(ToastContext)
    const toastError = useToastError()
    // confirmed state, resets whenever the isFollowing prop is refetched
    const [confirmed, setConfirmed] = createSignal(() => props.isFollowing)
    // what the screen shows: optimistic inside the action, confirmed otherwise
    const [following, setFollowing] = createOptimistic(() => confirmed())
    const [saving, setSaving] = createSignal(false)

    const toggle = action(function* () {
        if (saving()) return
        setSaving(true)
        try {
            setFollowing(!confirmed())
            const result: FollowResult | null | undefined = yield toggleFollowFn(props.targetUserId)
            if (result) {
                setConfirmed(result.following)
                props.onChange?.(result)
            } else {
                addToast({ text: "That user no longer exists.", type: "error" })
            }
        } 
        catch (error) {
            toastError(error)
        } 
        finally {
            setSaving(false)
        }
    })

    return (
        <button
            type="button"
            class={[following() ? "secondary" : "primary", styles.follow]}
            aria-pressed={following() ? "true" : "false"}
            disabled={saving()}
            onClick={() => toggle()}
        >
            <span class={[styles.label, styles.idle]}>{following() ? "Following" : "Follow"}</span>
            {/* on hover-capable devices, "Following" swaps to "Unfollow" without changing the button's width */}
            <Show when={following()}>
                <span class={[styles.label, styles.hover]} aria-hidden="true">
                    Unfollow
                </span>
            </Show>
        </button>
    )
}