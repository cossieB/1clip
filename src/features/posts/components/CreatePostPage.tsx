import { createSignal, For, Show } from "solid-js"
import styles from "./CreatePostPage.module.css"
import { Form } from "~/components/Forms/Form"
import { useCreatePost } from "../hooks/useCreatePost"
import { AsyncSelect } from "~/components/Forms/AsyncSelect"
import { gamesQueryOpts } from "~/features/games/utils/gameQueryOpts"
import { PostComposer } from "./PostComposer"
import { UploadBox } from "~/components/UploadBox/UploadBox"
import { ImagePreview } from "~/features/games/components/ImagePreview"

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
        <div
            class={`flexCenter ${styles.container}`}
        >
            <Form
                disabled={
                    input.title.length < 3 ||
                    input.text.length + input.link.length + files().length == 0
                }
                isPending={mutation.isPending || isUploading()}
                onSubmit={handleSubmit}
            >
                <Form.Input<typeof input>
                    field="title"
                    data-testid="create-title"
                    setter={val => setInput({ title: val })}
                    value={input.title}
                    required
                    minLength={3}
                    maxLength={30}
                />
                <UploadBox
                    label='Media'
                    maxSize={8}
                    onSuccess={async (array) => {
                        setFiles((prev) => [...prev, ...array.map(x => ({ field: "media", ...x }))].slice(0, 4))
                    }}
                    style={{ height: "10rem" }}
                    accept={{
                        audio: false,
                        image: true,
                        video: true
                    }}
                    limit={4}
                    data-uploadbox
                />
                <Show when={files().length > 0}>
                    <div class={styles.imgs}>
                        <For each={files()}>
                            {(file, i) => <ImagePreview
                                contentType={file.file.type}
                                class={styles.preview}
                                url={file.objectUrl}
                                onDelete={() => {
                                    setFiles(prev => prev.filter((_, j) => j != i()))
                                }}
                                metadata={{}}
                            />}
                        </For>
                    </div>
                </Show>

                <PostComposer
                    text={input.text}
                    setText={str => setInput({ text: str })}
                />
                <AsyncSelect
                    field=""
                    //@ts-expect-error
                    queryOptions={gamesQueryOpts()}
                    getLabel={game => game.title}
                    getValue={game => game.gameId}
                    selected={input.game?.gameId ?? null}
                    setSelected={game => setInput({ game })}
                />
            </Form>
        </div>
    )
}