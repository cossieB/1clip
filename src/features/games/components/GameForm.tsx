import { Form } from "~/components/Forms/Form";
import { UploadBox } from "~/components/UploadBox/UploadBox";
import { For, Show } from "solid-js";
import { YouTubeIframe } from "~/components/YoutubeIframe";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { mediaSrc } from "~/utils/mediaSrc";
import { AsyncSelect } from "~/components/Forms/AsyncSelect";
import { developersQueryOpts } from "~/features/developers/utils/developerQueryOpts";
import { publishersQueryOpts } from "~/features/publishers/utils/publisherQueryOpts";
import { ImagePreview } from "~/components/ImagePreview";
import { AsyncChecklist } from "~/components/Forms/AsyncChecklist";
import { platformsQueryOpts } from "~/features/platforms/utils/platformQueryOpts";
import { Game, MediaField, useGameForm } from "../hooks/useGameForm";
import styles from "./GameForm.module.css"

export function GameForm(props: { game?: Game }) {
    const {
        game,
        setGame,
        isUploading,
        createGameMutation,
        editGameMutation,
        setFiles,
        handleSubmit
    } = useGameForm(props)

    return (
        <Form
            onSubmit={handleSubmit}
            isPending={isUploading() || createGameMutation.isPending || editGameMutation.isPending}
            disabled={
                !game.title ||
                !game.cover ||
                !game.banner ||
                !game.developerId ||
                !game.publisherId ||
                !game.releaseDate
            }
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
                        setFiles(prev => [...prev.filter(x => x.field != MediaField.Cover), { ...file, field: MediaField.Cover }])
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
                        setFiles(prev => [...prev.filter(x => x.field != MediaField.Banner), { ...file, field: MediaField.Banner }])
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
                        setFiles(files.map(f => ({ ...f, field: MediaField.Screenshots })))
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
                        url={mediaSrc(m.key)}
                        contentType={m.contentType}
                        onDelete={() => {
                            setGame('media', prev => prev.filter(f => f.key != m.key))
                            setFiles(prev => prev.filter(a => a.objectUrl != m.key))
                        }}
                    />}
                </For>
            </div>
            <div style={{ "margin-top": "1.5rem" }}>
                <ContentEditable
                    html={game.summary}
                    setter={summary => setGame({ summary })}
                    label="Summary"
                />
            </div>
            <Form.Input
                field="releaseDate"
                setter={releaseDate => setGame({ releaseDate })}
                value={game.releaseDate}
                type="date"
            />
            <div style={{ "z-index": 50 }}>
                <AsyncSelect
                    field="Developer"
                    // @ts-expect-error
                    queryOptions={developersQueryOpts()}
                    getLabel={item => item.name}
                    getValue={item => item.developerId}
                    selected={game.developerId ?? null}
                    setSelected={dev => setGame({ developerId: dev.developerId })}
                />
            </div>
            <AsyncSelect
                field="Publisher"
                // @ts-expect-error
                queryOptions={publishersQueryOpts()}
                getLabel={item => item.name}
                getValue={item => item.publisherId}
                selected={game.publisherId ?? null}
                setSelected={pub => setGame({ publisherId: pub.publisherId })}
            />
            <div class={styles.platforms}>
                <AsyncChecklist
                    // @ts-expect-error
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

            <Show when={game.trailer}>
                <YouTubeIframe link={game.trailer!} />
            </Show>
            <Form.TagsInput
                setTags={tags => setGame('genres', tags)}
                tags={() => game.genres}
                label="Genres"
            />
        </Form>
    )
}