import { FormProvider } from "../Forms/FormContext";
import { PostBlock } from "./PostBlock";
import { Form } from "../Forms/Form";
import { type getAllPostsFn } from "~/serverFn/posts";
import { createSignal } from "solid-js";
import styles from "./PostId.module.css"

type Props = {
    post: Awaited<ReturnType<typeof getAllPostsFn>>[number]
}

export function PostId(props: Props) {

    const [comment, setComment] = createSignal("")
    const [isSubmitting, setIsSubmitting] = createSignal(false)

    return (
        <div class={styles.container}>
            <FormProvider>

                <PostBlock post={props.post!} />
                <Form
                    disabled={!comment()}
                    isPending={isSubmitting()}

                >
                    <Form.Textarea
                        field={""}
                        setter={val => setComment(val)}
                        value={comment()}
                        label="Add your comment..."
                    />
                </Form>
            </FormProvider>
        </div>
    )
}