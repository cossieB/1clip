import { For } from "solid-js"
import styles from "./CreatePostPage.module.css"
import { sanitizeText } from "~/utils/sanitizeText"
import { Form } from "~/components/Forms/Form"
import { UploadBox } from "~/components/UploadBox/UploadBox"
import { useCreatePost } from "../hooks/useCreatePost"
import { ImagePreview } from "~/components/ImagePreview"
import { AsyncSelect } from "~/components/Forms/AsyncSelect"
import { gamesQueryOpts } from "~/features/games/utils/gameQueryOpts"

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
                <AsyncSelect
                    field=""
                    //@ts-expect-error
                    queryOptions={gamesQueryOpts()}
                    getLabel={game => game.title}
                    getValue={game => game.gameId}
                    selected={input.game?.gameId ?? null}
                    setSelected={game => setInput({game})}
                />
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

