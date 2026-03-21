import { createSignal, For, Match, Switch } from "solid-js"
import styles from "./CreatePostPage.module.css"
import { Form } from "~/components/Forms/Form"
import { UploadBox } from "~/components/UploadBox/UploadBox"
import { useCreatePost } from "../hooks/useCreatePost"
import { ImagePreview } from "~/features/games/components/ImagePreview"
import { AsyncSelect } from "~/components/Forms/AsyncSelect"
import { gamesQueryOpts } from "~/features/games/utils/gameQueryOpts"
import { variables } from "~/utils/variables"
import { TwitchIframe } from "~/components/embeds/TwitchIframe"
import { YouTubeIframe } from "~/components/embeds/YoutubeIframe"
import { RadioInput } from "~/components/Forms/Radio"
import { StandaloneInput } from "~/components/Forms/FormInput"

export function CreatePostPage() {
    const { handleSubmit,
        input,
        isUploading,
        setInput,
        mutation,
        setFiles,
        files
    } = useCreatePost()

    const [embedError, setEmbedError] = createSignal(false)

    return (
        <div class='flexCenter'>
            <Form
                disabled={
                    input.title.length < 3 || 
                    input.text.length + files().length == 0 ||
                    embedError()
                }
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
                <div class={styles.modeselect}>
                    <RadioInput
                        list={["upload", "youtube", "twitch"]}
                        value={input.mode}
                        setValue={mode => {
                            setEmbedError(false)
                            setInput({ mode: mode as "upload" | "youtube" | "twitch" })
                        }}
                        name="create-post"
                    />
                </div>
                <div class={styles.embeds}>
                    <Switch>
                        <Match when={input.mode == "upload"}>
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
                                        metadata={{}}
                                    />}
                                </For>
                            </div>
                        </Match>
                        <Match when={input.mode == "youtube"}>
                            <StandaloneInput
                                field=""
                                label="Youtube Video Link"
                                value={input.clipLink}
                                setter={val => {
                                    setEmbedError(false)
                                    setInput({ clipLink: val });
                                }}
                                style={{width: "unset", margin: "0.75rem 0"}}                                
                            />
                            <YouTubeIframe link={input.clipLink} setError={setEmbedError} />
                        </Match>
                        <Match when={input.mode == "twitch"}>
                            <StandaloneInput
                                field=""
                                label="Twitch Clip Link"
                                value={input.clipLink}
                                setter={val => {
                                    setEmbedError(false)
                                    setInput({ clipLink: val });
                                }}
                                style={{width: "unset", margin: "0.75rem 0"}}
                            />
                            <TwitchIframe link={input.clipLink} setError={setEmbedError} />
                        </Match>
                    </Switch>
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
                    setSelected={game => setInput({ game })}
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

function ClipLinkInput(props: {
    value: string
    onChange: (val: string) => void
}) {
    return (
        <input type="text" value={props.value} onchange={e => props.onChange(e.currentTarget.value)} />
    )
}

