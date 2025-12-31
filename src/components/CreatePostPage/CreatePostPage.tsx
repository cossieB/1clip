import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query"
import { useServerFn } from "@tanstack/solid-start"
import { onCleanup, createSignal, For, Suspense } from "solid-js"
import { createStore } from "solid-js/store"
import { useGamesCache } from "~/hooks/useGameCache"
import { getGamesFn } from "~/serverFn/games"
import { createPostFn } from "~/serverFn/posts"
import { getPostSignedUrl } from "~/services/uploadService"
import { uploadToSignedUrl } from "~/utils/uploadToSignedUrl"
import { FormProvider } from "../Forms/FormContext"
import { UploadBox } from "../UploadBox/UploadBox"
import { Form } from "../Forms/Form"
import styles from "./CreatePostPage.module.css"
import { useToastContext } from "~/hooks/useToastContext"
import { useNavigate } from "@tanstack/solid-router"
import { sanitizeText } from "~/utils/sanitizeText"

export function CreatePostPage() {
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const result = useQuery(() => ({
        queryKey: ["games"],
        queryFn: () => getGamesFn()
    }))
    useGamesCache(result)
    const abortController = new AbortController()
    onCleanup(() => abortController.abort())

    const createAction = useServerFn(createPostFn)
    const getSignedUrls = useServerFn(getPostSignedUrl)

    const mutation = useMutation(() => ({
        mutationFn: createAction
    }))

    const [input, setInput] = createStore({
        title: "",
        text: "",
        media: [] as string[],
        game: null as { gameId: number, title: string } | null,
        tags: [] as string[],
    })

    let files: { file: File, signedUrl: string, key: string }[] = []
    const [isUploading, setIsUploading] = createSignal(false)
    const [preview, setPreview] = createSignal("")
    async function handleSubmit(e: SubmitEvent) {
        const { game, ...rest } = input
        e.preventDefault();
        try {
            setIsUploading(true)
            await Promise.all(files.map(file => uploadToSignedUrl(file.signedUrl, file.file, { signal: abortController.signal })))
            setIsUploading(false)
            mutation.mutate({
                data: {
                    ...rest,
                    gameId: input.game?.gameId,
                    media: files.map(f => ({
                        contentType: f.file.type,
                        key: f.key
                    })),
                },
                signal: abortController.signal
            }, {
                onError(error, variables, onMutateResult, context) {
                    addToast({ text: error.message, type: "error" })
                },
                onSuccess(response, variables) {
                    queryClient.invalidateQueries({ queryKey: ["posts"] })
                    navigate({ to: "/posts/$postId", params: { postId: response.postId } })
                },
            })
        } 
        catch (error) {
            addToast({text: "Something went wrong. Please try again later", type: "error"})
        }
    }
    return (
        <div class='flexCenter'>
            <FormProvider>
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
                            const response = await Promise.all(array.map(file => getSignedUrls({
                                data: {
                                    contentLength: file.file.size,
                                    contentType: file.file.type,
                                    filename: file.file.name
                                },
                                signal: abortController.signal
                            })))
                            files = array.map((item, i) => ({ ...item, ...response[i] }))
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
                        tags={() => input.tags}
                        setTags={tags => setInput('tags', tags)}
                    />
                </Form>
            </FormProvider>
        </div>
    )
}