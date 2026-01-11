import { For, Suspense } from "solid-js"
import styles from "./CreatePostPage.module.css"
import { sanitizeText } from "~/utils/sanitizeText"
import { Form } from "~/components/Forms/Form"
import { UploadBox } from "~/components/UploadBox/UploadBox"
import { useCreatePost } from "../hooks/useCreatePost"
import { Trash2Icon } from "lucide-solid"
import { ImagePreview } from "~/components/ImagePreview"

export function CreatePostPage() {
    const { handleSubmit,
        input,
        isUploading,
        setInput,
        mutation,
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
                        setFiles(array.map(x => ({ field: "media", ...x })))
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
                        {(src, i) => <ImagePreview
                            class={styles.preview}
                            img={src}
                            onDelete={() => {
                                setInput('media', prev => prev.filter(f => f != src))
                                setFiles(prev => prev.filter((_, j) => j != i()))
                            }}
                        />}
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
                        selected={input.game?.gameId ?? null}
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

