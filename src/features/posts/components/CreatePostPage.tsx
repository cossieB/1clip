import { createEffect, createSignal, For, Show, Suspense } from "solid-js"
import styles from "./CreatePostPage.module.css"
import { Form } from "~/components/Forms/Form"
import { useCreatePost } from "../hooks/useCreatePost"
import { PostComposer } from "./PostComposer"
import { UploadBox } from "~/components/UploadBox/UploadBox"
import { ImagePreview } from "~/features/games/components/ImagePreview"
import { StandaloneInput } from "~/components/Forms/FormInput"
import { useQuery } from "@tanstack/solid-query"
import { getGamesWithoutExtras } from "~/features/games/gamesApi"
import { useAbortController } from "~/hooks/useAbortController"
import { debounce } from "~/lib/debounce"
import { SearchGames } from "./SearchGames"

export function CreatePostPage() {
    const { handleSubmit,
        input,
        isUploading,
        setInput,
        mutation,
        setFiles,
        files
    } = useCreatePost()
    const abortController = useAbortController()
    let searchRef!: HTMLInputElement
    const [searchQuery, _setSearchQuery] = createSignal("")
    const setSearchQuery = debounce(_setSearchQuery, 500)

    const searchResults = useQuery(() => ({
        queryKey: ["s", searchQuery()],
        enabled: !!searchQuery(),
        queryFn: () => getGamesWithoutExtras({ data: searchQuery(), signal: abortController.signal })
    }))
    return (
        <div class={`flexCenter ${styles.container}`}>
            <Form
                disabled={
                    input.title.length < 3 ||
                    files().length + input.text.length === 0
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
                                    setFiles(prev => prev.filter((_, j) => j != i()));
                                    URL.revokeObjectURL(files()[i()].objectUrl)
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
                <Show when={input.game}>
                    {input.game?.title}
                </Show>
                <SearchGames
                    onSelect={game => setInput({game})}
                />
            </Form>
        </div>
    )
}