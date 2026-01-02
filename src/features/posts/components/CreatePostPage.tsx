import { For, Suspense } from "solid-js"
import styles from "./CreatePostPage.module.css"
import { sanitizeText } from "~/utils/sanitizeText"
import { Form } from "~/components/Forms/Form"
import { UploadBox } from "~/components/UploadBox/UploadBox"
import { useCreatePost } from "../hooks/useCreatePost"

export function CreatePostPage() {
    const { handleSubmit,
        input,
        isUploading,
        setInput,
        mutation,
        abortController,
        getSignedUrl,
        preview,
        setPreview,
        result,
        setFiles,
     } = useCreatePost()

    return (
        <div class='flexCenter'>
            <Form
                disabled={!input.title || input.text.length + input.media.length == 0}
                isPending={mutation.isPending || isUploading()}
                onSubmit={handleSubmit}
            >
                <Form.Input<typeof input>
                    field="title"
                    setter={val => setInput({ title: val })}
                    value={input.title}
                    required
                />
                <UploadBox
                    label='Images'
                    maxSize={2}
                    onSuccess={async (array) => {
                        setInput('media', array.map(file => file.objectUrl))
                        const response = await Promise.all(array.map(file => getSignedUrl({
                            data: {
                                contentLength: file.file.size,
                                contentType: file.file.type,
                                filename: file.file.name
                            },
                            signal: abortController.signal
                        })))
                        setFiles(array.map((item, i) => ({ ...item, ...response[i] })))
                    }}
                    style={{ height: "10rem" }}
                    accept={{
                        audio: false,
                        image: true,
                        video: true
                    }}
                    limit={4}
                />
                <div class={styles.imgs}>
                    <For each={input.media}>
                        {file =>
                            <img src={file} />
                        }
                    </For>
                </div>
                <Form.Textarea<typeof input>
                    field="text"
                    setter={val => {
                        setInput({ text: val });
                        sanitizeText(val).then(str => setPreview(str))
                    }}
                    value={input.text}
                    maxLength={255}
                />
                <div innerHTML={preview()} />
                <Suspense>
                    <Form.FormSelect<typeof input>
                        selected={input.game ? { label: input.game.title, value: input.game.gameId } : null}
                        list={result.data!.map(game => ({
                            label: game.title,
                            value: game.gameId
                        }))}
                        required={false}
                        field="game"
                        setter={val => setInput('game', val ? { gameId: val.value as number, title: val.label } : null)}
                    />
                </Suspense>
                <Form.TagsInput
                    tagLimit={5}
                    tagLength={15}
                    tags={() => input.tags}
                    setTags={tags => setInput('tags', tags)}
                />
            </Form>
        </div>
    )
}