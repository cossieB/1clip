import { action, affects, createOptimistic, createSignal, isPending, Loading, refresh, Refreshable, Show, StoreSetter, untrack, useContext } from "solid-js"
import styles from "./CommentComposer.module.css"
import { session } from "~/features/auth/authApi"
import { mediaSrc } from "~/utils/mediaSrc"
import { Editor } from "~/components/Forms/Editor"
import { addCommentFn, type getCommentsByPostIdFn } from "./commentsApi"
import { sleep } from "~/lib/sleep"
import { ToastContext } from "~/components/Toast/ToastProvider"

type Props = {
    replyTo?: number
    postId: number
    comments: Refreshable<Awaited<ReturnType<typeof getCommentsByPostIdFn>>>
    setComments: StoreSetter<Awaited<ReturnType<typeof getCommentsByPostIdFn>>>
}

export function CommentComposer(props: Props) {
    const {addToast} = useContext(ToastContext)
    const [content, setContent] = createSignal("")
    const [isSubmitting, setIsSubmitting] = createOptimistic(false)
    
    const sendComment = action(async function* () {
        affects(props.comments);
        setIsSubmitting(true)
        const user = untrack(session).data?.user
        if (!user) return addToast({
            text: "Session expired. Please reload the page",
            type: "warning",
            autoFades: false
        })
        try {
            props.setComments(s => {
                s.push({
                    author: {
                        id: user.id,
                        image: user.image!,
                        username: user.displayUsername!
                    },
                    commentId: -Math.random(),
                    createdAt: new Date(),
                    editedOn: new Date(),
                    likeCount: 0,
                    likedByCurrentUser: false,
                    postId: props.postId,
                    replyCount: 0,
                    replyTo: props.replyTo ?? null,
                    text: content()
                })
            })
            yield sleep(500);
            yield addCommentFn({
                originalPost: props.postId,
                text: content(),
                replyTo: props.replyTo
            })
            refresh(props.comments)
            
        } catch (error: any) {
            addToast({
                text: error.message ?? "Somethign went wrong. Please try again later",
                type: "error"
            })
        }
    })
    return (
        <Loading>
            <Show when={session().data?.user.emailVerified}>
                <section class={["card", styles.compose]} aria-label="Create post">
                    <img class={styles.avatar} src={mediaSrc(session().data!.user.image!)} alt="" />

                    <div class={styles.group}>
                        <Editor
                            content={content}
                            setContent={setContent}
                            maxlength={255}
                            placeholder="Reply to this post"
                        />

                        <div class={styles.row}>
                            <button
                                class={["primary", styles.postBtn]}
                                disabled={isSubmitting()}
                                onClick={() => {
                                    sendComment()
                                }}
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </section>
            </Show>
        </Loading>
    )
}