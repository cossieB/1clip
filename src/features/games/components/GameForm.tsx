import { AwaitedReturn } from "~/lib/utilityTypes";
import { getGameFn } from "../gamesApi";
import { useGameForm } from "../hooks/useGameForm";
import styles from "./GameForm.module.css"
import { TextField } from "~/components/Forms/Textfield";
import z from "zod";
import { ImageUpload } from "~/components/Forms/ImageUpload";
import { DropZone } from "~/components/Forms/DropZone";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { SearchAutocomplete } from "~/components/SearchAutocomplete/SearchAutocomplete";
import { searchCompaniesFn } from "~/features/companies/companiesApi";
import { createStore, For, Show } from "solid-js";
import { IframeFactory } from "~/features/posts/components/IframeFactory";
import { TagSelector } from "./TagSelector";
import { mediaSrc } from "~/utils/mediaSrc";
import { RenderMedia } from "~/components/RenderMedia";
import { InfoIcon, MinusIcon, PlusIcon, Trash2Icon } from "@lucide/solid";
import { Popover } from "~/components/Popover/Popover";
import { PlatformSelector } from "./PlatformSelector";
import { CharacterEditor } from "~/components/CharacterEditor/CharacterEditor";

export function GameForm(props: { game?: AwaitedReturn<typeof getGameFn> }) {
    const {
        game,
        setGame,
        isUploading,
        files,
        setFiles,
        handleSubmit
    } = useGameForm(props)

    return (
        <form
            class={["form card", styles.form]}
        >

            <TextField
                label="Title"
                required
                schema={z.string()}
                value={game.title}
                onInput={val => setGame(s => { s.title = val })}
            />
            <div class={styles.images} >
                <ImageUpload
                    setFile={file => setFiles(s => {
                        const existing = s.find(f => f.field === "cover")
                        if (existing) {
                            existing.file = file;
                            existing.metadata = undefined
                            existing.convertedFile = undefined
                            return;
                        }
                        s.push({
                            field: "cover",
                            file,
                        })
                    })}
                    image={game.cover}
                    maxSize={2 * 1024 * 1024}
                />
                <ImageUpload
                    setFile={file => setFiles(s => {
                        const existing = s.find(f => f.field === "banner")
                        if (existing) {
                            existing.file = file;
                            existing.metadata = undefined
                            existing.convertedFile = undefined
                            return;
                        }
                        s.push({
                            field: "banner",
                            file,
                        })
                    })}
                    image={game.banner}
                    maxSize={4 * 1024 * 1024}
                />
            </div>
            <DropZone
                files={files().map(x => x.file)}
                onAdd={added => {
                    setFiles(s => {
                        s.push(...added.map(a => ({
                            file: a,
                            field: "media"
                        })))
                    })
                }}
                onRemove={removed => setFiles(s => s.filter(x => x.file != removed))}
                accept="video/mp4, video/webm, video/ogg, audio/mpeg, audio/wav, audio/ogg, audio/aac, audio/midi, audio/x-midi, audio/webm, image/jpeg, image/png, image/webp, image/gif"
                maxSize={8 * 1024 * 1024}
            />
            <div class={styles.screenshots}>
                <For each={game.media}>
                    {(m, i) => (
                        <div>
                            <RenderMedia contentType={m.contentType} url={mediaSrc(m.key)} />
                            <button
                                class={styles.delBtn}
                                type="button"
                                onClick={() => {
                                    setGame(s => { s.media = s.media.filter(f => f.key != m.key) })
                                }}
                            >
                                <Trash2Icon size={16} />
                            </button>
                            <button
                                class={styles.metadataBtn}
                                type="button"
                                popovertarget={m.key}
                            >
                                <InfoIcon size={16} />
                            </button>
                            <Popover id={m.key}>
                                <MetadataEdit
                                    metadata={m.metadata}
                                    setMetadata={metadata => {
                                        setGame(s => {
                                            metadata && (s.media[i()].metadata = metadata as Record<string, string>)
                                        })
                                    }}
                                />
                            </Popover>
                        </div>
                    )}
                </For>
            </div>
            <ContentEditable
                html={game.summary}
                setter={summary => setGame(s => { s.summary = summary })}
                label="Summary"
            />
            <TextField
                label="Release Date"
                onChange={e => setGame(s => { s.releaseDate = e.currentTarget.value })}
                type="date"
                value={game.releaseDate}

            />
            <SearchAutocomplete
                search={input => searchCompaniesFn(input)}
                label={`Developer ${game ? `(${game.developerName})` : ""}`}
                getLabel={dev => dev.name}
                noun="developer"
                onSelect={dev => setGame(s => { s.developerId = dev.companyId })}
                debounceMs={500}
            />
            <SearchAutocomplete
                label={`Publisher ${game ? `(${game.publisherName})` : ""}`}
                search={input => searchCompaniesFn(input)}
                getLabel={item => item.name}
                onSelect={pub => setGame(s => { s.publisherId = pub.companyId })}
                noun="publisher"
                debounceMs={500}
            />
            <PlatformSelector
                initialPlatformIds={game.platforms.map(platform => platform.platformId)}
                onPlatformsChanged={platforms => setGame(g => {
                    g.platforms = platforms.map(platformId => ({ platformId })) 
                })}
            />
            <TextField
                label="Trailer"
                schema={z.url()}
                required
                type="url"
                value={game.trailer}
                onChange={e => setGame(s => { s.trailer = e.currentTarget.value.trim() })}
            />
            <Show when={game.trailer}>
                <div class={styles.trailer}>
                    <IframeFactory link={game.trailer!} />
                </div>
            </Show>
            <TagSelector
                genres={game.genres}
                onUpdate={genres => setGame(s => { s.genres = genres })}
            />
            <CharacterEditor
                game={props.game ?? { gameId: 0, title: game.title }}
                appearances={game.actors.map(a => ({
                    ...a,
                    actorName: a.name,
                    gameTitle: game.title
                }))}
                onChange={appearances => {
                    setGame(s => {
                        // @ts-expect-error
                        s.actors = appearances.map(ap => ({
                            ...ap,
                            name: ap.actorName
                        }))
                    })
                }}
            />
            <button
                class="primary"
                type="submit"
                disabled={
                    !game.title ||
                    !game.cover ||
                    !game.banner ||
                    !game.developerId ||
                    !game.publisherId ||
                    !game.releaseDate ||
                    !game.trailer ||
                    game.platforms.length == 0 ||
                    isUploading() ||
                    game.actors.some(role => !role.character)
                }
            >
                Submit
            </button>
        </form>
    )
}

type P = {
    metadata: Record<string, string>
    setMetadata(metadata: Record<string, string | undefined>): void
}

function MetadataEdit(props: P) {

    const [input, setInput] = createStore({
        key: "",
        value: ""
    })

    return (
        <div
            class={styles.metadataPopover}
        >
            <div class={styles.inputs}>
                <input value="artist" type="text" disabled />
                <input type="text" value={props.metadata.artist} onInput={e => props.setMetadata({ ...props.metadata, artist: e.currentTarget.value || undefined })} />
            </div>
            <div class={styles.inputs}>
                <input value="title" type="text" disabled />
                <input type="text" value={props.metadata.title} onInput={e => props.setMetadata({ ...props.metadata, title: e.currentTarget.value || undefined })} />
            </div>

            <div class={styles.inputs}>
                <input type="text" placeholder="key" value={input.key} onInput={e => setInput(s => { s.key = e.currentTarget.value })} />
                <input type="text" placeholder="value" value={input.value} onInput={e => setInput(s => { s.value = e.currentTarget.value })} />
                <button
                    class={styles.btn}
                    disabled={!input.key || !input.value}
                    type="button"
                    onClick={() => {
                        props.setMetadata({ ...props.metadata, [input.key]: input.value || undefined })
                        setInput(s => {
                            s.key = "";
                            s.value = ""
                        })
                    }}
                >
                    <PlusIcon size={12} />
                </button>
                <button
                    type="button"
                    class={`${styles.rmBtn} ${styles.btn}`}
                    disabled={!input.key}
                    onClick={() => {
                        props.setMetadata({ ...props.metadata, [input.key]: undefined })
                        setInput(s => {
                            s.key = "";
                            s.value = ""
                        })
                    }}
                >
                    <MinusIcon size={12} />
                </button>
            </div>
            <pre>
                {JSON.stringify(props.metadata, null, 4)}
            </pre>
        </div>
    )
}