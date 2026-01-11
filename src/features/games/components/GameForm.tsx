import { createStore, unwrap } from "solid-js/store";
import { Form } from "~/components/Forms/Form";
import { UploadBox } from "~/components/UploadBox/UploadBox";
import { useUpload } from "~/hooks/useUpload";
import { getGameFn } from "~/serverFn/games";
import { For, Show } from "solid-js";
import { YouTubeIframe } from "~/components/YoutubeIframe";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { mediaSrc } from "~/utils/mediaSrc";
import { AsyncSelect } from "~/components/Forms/AsyncSelect";
import { developersQueryOpts } from "~/features/developers/utils/developerQueryOpts";
import { publishersQueryOpts } from "~/features/publishers/utils/publisherQueryOpts";
import { ImagePreview } from "~/components/ImagePreview";
import styles from "./GameForm.module.css"
import { AsyncChecklist } from "~/components/Forms/AsyncChecklist";
import { platformsQueryOpts } from "~/features/platforms/utils/platformQueryOpts";

type Game = Awaited<ReturnType<typeof getGameFn>>

export function GameForm(props: { game: Game }) {
    const [game, setGame] = createStore(props.game)
    const { setFiles, files } = useUpload(["games", props.game.gameId.toString()])

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        console.log(unwrap(files()))
    }

    return (
        <Form
            onSubmit={handleSubmit}            
        >
            <Form.Input
                field="title"
                setter={title => setGame({ title })}
                value={game.title ?? ""}
            />
            <div class={styles.images}>
                <UploadBox
                    label="Avatar"
                    onSuccess={async files => {
                        const file = files.at(0)
                        if (!file) return
                        setGame({ cover: file.objectUrl })
                        setFiles(prev => [...prev.filter(x => x.field != "cover"), { ...file, field: "cover" }])
                    }}
                    maxSize={1}
                    limit={1}
                    accept={{
                        image: true,
                        audio: false,
                        video: false
                    }}
                />
                <UploadBox
                    label="Banner"
                    onSuccess={async files => {
                        const file = files.at(0)
                        if (!file) return
                        setGame({ banner: file.objectUrl })
                        setFiles(prev => [...prev.filter(x => x.field != "banner"), { ...file, field: "banner" }])
                    }}
                    maxSize={4}
                    limit={1}
                    accept={{
                        image: true,
                        audio: false,
                        video: false
                    }}
                />
                <div class={styles.preview}>
                    <div><img src={mediaSrc(game.cover)} /></div>
                    <div><img src={mediaSrc(game.banner)} /></div>
                </div>
            </div>
            <div class={styles.screenshotbox}>

                <UploadBox
                    label="Screenshots"
                    onSuccess={async files => {
                        setGame('media', prev => [
                            ...prev,
                            ...files.map(x => ({
                                key: x.objectUrl,
                                contentType: x.file.type
                            }))
                        ])
                        setFiles(files.map(f => ({ ...f, field: "screenshots" })))
                    }}
                    accept={{
                        image: true,
                        video: false,
                        audio: false
                    }}
                    limit={Infinity}
                    maxSize={4}
                />
            </div>
            <div class={styles.screenshots}>
                <For each={game.media}>
                    {(m, i) => <ImagePreview
                        img={mediaSrc(m.key)}
                        onDelete={() => {
                            setGame('media', prev => prev.filter(f => f.key != m.key))
                            setFiles(prev => prev.filter(a => a.objectUrl != m.key))
                        }}
                    />}
                </For>
            </div>
            <ContentEditable
                html={game.summary}
                setter={summary => setGame({ summary })}
            />
            <Form.Input
                field="releaseDate"
                setter={releaseDate => setGame({ releaseDate })}
                value={game.releaseDate}
                type="date"
            />
            <div style={{ "z-index": 50 }}>
                <AsyncSelect
                    field="Developer"
                    queryOptions={developersQueryOpts()}
                    getLabel={item => item.name}
                    getValue={item => item.developerId}
                    selected={game.developerId ?? null}
                    setter={val => setGame({ developerId: val as number | undefined })}
                />
            </div>
            <AsyncSelect
                field="Publisher"
                queryOptions={publishersQueryOpts()}
                getLabel={item => item.name}
                getValue={item => item.publisherId}
                selected={game.publisherId ?? null}
                setter={val => setGame({ publisherId: val as number | undefined })}
            />
            <div class={styles.platforms}>
                <AsyncChecklist
                    queryOptions={platformsQueryOpts()}
                    getLabel={platform => platform.name}
                    getValue={platform => platform.platformId}
                    selected={game.platforms}
                    setter={platforms => setGame({ platforms })}
                />
            </div>
            <Form.Input<typeof game>
                field="trailer"
                setter={trailer => setGame({ trailer })}
                value={game.trailer ?? ""}
            />
            <Form.TagsInput
                setTags={tags => setGame('tags', tags)}
                tags={() => game.tags}
                label="Genres"
            />
            <Show when={game.trailer}>
                <YouTubeIframe link={game.trailer!} />
            </Show>
        </Form>
    )
}