import { createStore, unwrap } from "solid-js/store";
import { Form } from "~/components/Forms/Form";
import { UploadBox } from "~/components/UploadBox/UploadBox";
import { useUpload } from "~/hooks/useUpload";
import { createGameFn, getGameFn, updateGameFn } from "~/serverFn/games";
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
import { useMutation } from "@tanstack/solid-query";
import { useServerFn } from "@tanstack/solid-start";
import { useToastContext } from "~/hooks/useToastContext";
import { useNavigate } from "@tanstack/solid-router";

type Game = Awaited<ReturnType<typeof getGameFn>>

enum MediaField {
    Cover = "cover",
    Banner = "banner",
    Screenshots = "screenshots"
}

export function GameForm(props: { game?: Game }) {
    const { addToast } = useToastContext()
    const navigate = useNavigate()
    const [game, setGame] = createStore({
        gameId: props.game?.gameId,
        title: props.game?.title ?? "",
        cover: props.game?.cover ?? "",
        banner: props.game?.banner ?? "",
        developerId: props.game?.developerId ?? -1,
        publisherId: props.game?.publisherId ?? -1,
        summary: props.game?.summary ?? "",
        media: props.game?.media ?? [],
        platforms: props.game?.platforms ?? [],
        trailer: props.game?.trailer ?? "",
        releaseDate: props.game?.releaseDate ?? "",
        genres: props.game?.genres ?? [],
        actors: props.game?.actors ?? []
    })
    const paths = game.gameId ? ["games", game.gameId.toString()] : ["games"]
    const { setFiles, files, isUploading, upload } = useUpload(paths)

    const editGameMutation = useMutation(() => ({
        mutationFn: useServerFn(updateGameFn)
    }))

    const createGameMutation = useMutation(() => ({
        mutationFn: useServerFn(createGameFn)
    }))
    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        try {
            const uploadResult = await upload();
            const newCover = uploadResult.find(x => x.field == MediaField.Cover)?.key
            const newBanner = uploadResult.find(x => x.field == MediaField.Banner)?.key
            setGame({
                ...newCover && { cover: newCover },
                ...newBanner && { banner: newBanner },
                media: [
                    ...game.media,
                    ...uploadResult
                        .filter(x => x.field === MediaField.Screenshots)
                        .map(x => ({ key: x.key, contentType: x.file.type }))]
            })
            const { gameId, ...rest } = game
            if (gameId) {
                return editGameMutation.mutate({
                    data: {
                        ...rest,
                        gameId,
                        platforms: rest.platforms.map(platform => platform.platformId)
                    }
                }, {
                    onSuccess(data, variables, onMutateResult, context) {
                        addToast({ text: "Successfully edited game, ", type: "info" })
                    },
                    onError(error, variables, onMutateResult, context) {
                        addToast({ text: error.message, type: "error" })
                    },
                })
            }
            return createGameMutation.mutate({
                data: {
                    ...rest,
                    platforms: rest.platforms.map(platform => platform.platformId)
                }
            }, {
                onSuccess(data, variables, onMutateResult, context) {
                    addToast({ text: "Successfully created game, " + data, type: "info" })
                    navigate({ to: "/admin/games/$gameId/edit", params: { gameId: data } })
                },
                onError(error, variables, onMutateResult, context) {
                    addToast({ text: error.message, type: "error" })
                },
            })
        }
        catch (error) {

        }
    }

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
                        img={mediaSrc(m.key)}
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
                setTags={tags => setGame('genres', tags)}
                tags={() => game.genres}
                label="Genres"
            />
            <Show when={game.trailer}>
                <YouTubeIframe link={game.trailer!} />
            </Show>
        </Form>
    )
}