import { createEffect, createOptimisticStore, createSignal, For, Loading, onSettled, Show, snapshot } from "solid-js";
import { getCommentsByPostIdFn } from "../commentsApi";
import { Spinner } from "~/components/Loader/Spinner";
import { CommentBlock } from "./CommentBlock";
import { session } from "~/features/auth/authApi";
import { CommentComposer } from "./CommentComposer";
import { AwaitedReturn } from "~/lib/utilityTypes";

type Props = {
    postId: number
    replyTo?: number
}

type Comment = AwaitedReturn<typeof getCommentsByPostIdFn>

export function CommentList(props: Props) {
    let lastItem: HTMLElement | undefined
    let done = false
    const [cursor, setCursor] = createSignal<NonNullable<Parameters<typeof getCommentsByPostIdFn>[0]>['cursor']>()
    const [comments, setComments] = createOptimisticStore(async (prev: Comment = []) => {
        const next = await getCommentsByPostIdFn({
            ...props,
            cursor: cursor()
        });
        if (next.length === 0) done = true
        return [...prev, ...next]
    }, [], {
        key: (item) => item.commentId,
        name: "commentList",
    })

    let observer: IntersectionObserver

    createEffect(
        () => comments.length,
        () => {
            setTimeout(() => {
                const cards = document.querySelectorAll<HTMLElement>(`[data-comment-id]`);
                if (cards.length === 0) return; 
                lastItem && observer?.unobserve(lastItem); 
                lastItem = cards[cards.length - 1];
                observer?.observe(lastItem); 
            }, 50)
        }
    )

    onSettled(() => {
        observer = new IntersectionObserver(entries => {
            const last = entries.at(-1); 
            if (last?.isIntersecting && !done) {
                const commentId = Number((last.target as HTMLElement).dataset.commentId); 
                const item = comments.find(comment => comment.commentId === commentId); 
                if (item) setCursor(commentId)
            }            
        })
        return () => observer?.disconnect()
    })


    return (
        <Loading fallback={<Spinner />}>
            <Show when={session().data && !props.replyTo}>
                <CommentComposer
                    comments={comments}
                    setComments={setComments}
                    postId={props.postId}
                />
            </Show>
            <For each={comments}>
                {comment => <CommentBlock
                    comment={comment}
                    canInteract={session().data?.user.emailVerified && comment.commentId > 0}
                    comments={comments}
                    setComments={setComments}
                />}
            </For>
        </Loading>
    )
}