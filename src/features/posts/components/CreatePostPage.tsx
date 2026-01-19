import { For } from "solid-js"
import styles from "./CreatePostPage.module.css"
import { Form } from "~/components/Forms/Form"
import { UploadBox } from "~/components/UploadBox/UploadBox"
import { useCreatePost } from "../hooks/useCreatePost"
import { ImagePreview } from "~/components/ImagePreview"
import { AsyncSelect } from "~/components/Forms/AsyncSelect"
import { gamesQueryOpts } from "~/features/games/utils/gameQueryOpts"
import { variables } from "~/utils/variables"

export function CreatePostPage() {
    const { handleSubmit,
        input,
        isUploading,
        setInput,
        mutation,
        setFiles,
        files
    } = useCreatePost()

    return (
        <div class='flexCenter'>
            <Form
                disabled={input.title.length < 3 || input.text.length + files().length == 0}
                isPending={mutation.isPending || isUploading()}
                onSubmit={handleSubmit}
            >
                <Form.Input<typeof input>
                    field="title"
                    setter={val => setInput({ title: val })}
                    value={input.title}
                    required
                    minLength={3}
                />
                <UploadBox
                    label='Images'
                    maxSize={4}
                    onSuccess={async (array) => {
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
                    <For each={files()}>
                        {(file, i) => <ImagePreview
                            contentType={file.file.type}
                            class={styles.preview}
                            url={file.objectUrl}
                            onDelete={() => {
                                setFiles(prev => prev.filter((_, j) => j != i()))
                            }}
                        />}
                    </For>
                </div>
                <Form.Textarea<typeof input>
                    field="text"
                    setter={val => {
                        setInput({ text: val });
                    }}
                    value={input.text}
                    maxLength={variables.POST_LIMIT}
                />
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

