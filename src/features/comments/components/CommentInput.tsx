import { ComponentProps, Show, splitProps } from "solid-js";
import { StandaloneTextarea } from "~/components/Forms/FormTextarea";
import { SubmitBtn } from "~/components/Forms/SubmitBtn";
import styles from "./CommentInput.module.css"
import { useQuery } from "@tanstack/solid-query";
import { sessionQueryOpts } from "~/hooks/useServerSession";

type P = {
    comment: string;
    isPending: boolean
    setComment: (val: string) => void
    submit(): void
} & ComponentProps<"textarea">

export default function CommentInput(props: P) {
    const session = useQuery(() => sessionQueryOpts());
    
    const [_, rest] = splitProps(props, ['comment', 'isPending', 'setComment', 'submit'])
    return (
        <div
            class={styles.commentArea}
            classList={{ [styles.nonEmpty]: props.comment.length > 0 }}
        >
            <Show when={session.data?.emailVerified}>
                <StandaloneTextarea
                    {...rest}
                    label="Add your comment..."
                    setter={val => props.setComment(val)}
                    value={props.comment}
                    maxLength={255}
                    id={styles.cmt}
                />
                <div class={styles.btns}>
                    <SubmitBtn
                        disabled={props.comment.length === 0}
                        isPending={props.isPending}
                        onclick={props.submit}
                    />
                    <button onclick={() => props.setComment("")}>
                        Cancel
                    </button>
                </div>
            </Show>
        </div>
    )
}