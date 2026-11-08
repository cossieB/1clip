import { action, createOptimistic, createSignal, useContext, type Accessor } from "solid-js"
import { ToastContext } from "~/components/Toast/ToastProvider"

export type LikeState = {
    liked: boolean
    count: number
}

type ToggleResult = {
    liked: boolean
    likeCount: number
} | null | undefined

type Options = {
    /** Server-confirmed state. Re-read whenever the underlying post/comment is refetched. */
    initial: () => LikeState
    /** Performs the toggle on the server. */
    request: () => Promise<ToggleResult>
}

export function useToggleLike(options: Options): {
    like: Accessor<LikeState>
    toggle: () => void
} {
    const { addToast } = useContext(ToastContext)
    // confirmed state, resets whenever `initial` changes
    const [likeState, setLikeState] = createSignal(() => options.initial())
    // what the screen shows: optimistic inside the action, confirmed otherwise
    const [like, setLike] = createOptimistic(() => likeState())

    const toggle = action(function* () {
        try {
            const current = likeState()
            setLike({
                liked: !current.liked,
                count: current.count + (current.liked ? -1 : 1),
            })
            const result: ToggleResult = yield options.request()
            if (result) setLikeState({ liked: result.liked, count: result.likeCount })
        }
        catch (error) {
            addToast({
                text: error instanceof Error && error.message
                    ? error.message
                    : "Something went wrong. Please try again later.",
                type: "error",
            })
        }
    })

    return { like, toggle: () => toggle() }
}