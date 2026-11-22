import { AwaitedReturn } from "~/lib/utilityTypes";
import { getGameFn } from "../gamesApi";
import { MediaField, useGameForm } from "../hooks/useGameForm";
import styles from "./GameForm.module.css"
import { TextField } from "~/components/Forms/Textfield";
import z, { number } from "zod";
import { ImageUpload } from "~/components/Forms/ImageUpload";
import { DropZone } from "~/components/Forms/DropZone";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { SearchAutocomplete } from "~/components/SearchAutocomplete/SearchAutocomplete";
import { searchCompaniesFn } from "~/features/companies/companiesApi";
import { createSignal, createStore, For, Show, snapshot } from "solid-js";
import { IframeFactory } from "~/features/posts/components/IframeFactory";
import { TagSelector } from "./TagSelector";
import { mediaSrc } from "~/utils/mediaSrc";
import { RenderMedia } from "~/components/RenderMedia";
import { InfoIcon, MinusIcon, PlusIcon, Trash2Icon } from "@lucide/solid";
import { Popover } from "~/components/Popover/Popover";
import { PlatformSelector } from "./PlatformSelector";
import { CharacterEditor } from "~/components/CharacterEditor/CharacterEditor";
import { MetadataEditor } from "~/components/Forms/MetadataEditor";

export function GameForm(props: { game?: AwaitedReturn<typeof getGameFn> }) {
    const {
        game,
        setGame,
        isUploading,
        files,
        setFiles,
        handleSubmit
    } = useGameForm(props)
    const [editing, setEditing] = createSignal<{ m: typeof game.media[number], i: number } | null>(null)
    return (
        <div>
            <form
                class={["form card", styles.form]}
                autocomplete="off"
                onSubmit={handleSubmit}
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
                        setFile={(file, objectUrl) => {
                            setGame(g => { g.cover = objectUrl })
                            setFiles(s => {
                                const existing = s.find(f => f.field === MediaField.Cover)
                                if (existing) {
                                    existing.file = file;
                                    existing.metadata = undefined
                                    existing.convertedFile = undefined
                                    return;
                                }
                                s.push({
                                    field: MediaField.Cover,
                                    file,
                                })
                            })
                            setGame(g => {
                                g.cover = file.name
                            })
                        }}
                        image={game.cover}
                        maxSize={2 * 1024 * 1024}
                    />
                    <ImageUpload
                        setFile={(file, objectUrl) => {
                            setGame(g => { g.banner = objectUrl })
                            setFiles(s => {
                                const existing = s.find(f => f.field === MediaField.Banner)
                                if (existing) {
                                    existing.file = file;
                                    existing.metadata = undefined
                                    existing.convertedFile = undefined
                                    return;
                                }
                                s.push({
                                    field: MediaField.Banner,
                                    file,
                                })
                            })
                            setGame(g => {
                                g.banner = file.name
                            })
                        }}
                        image={game.banner}
                        maxSize={4 * 1024 * 1024}
                    />
                </div>
                <DropZone
                    files={files().filter(x => x.field == MediaField.Media).map(x => x.file)}
                    onAdd={added => {
                        setFiles(s => {
                            s.push(...added.map(a => ({
                                file: a,
                                field: MediaField.Media
                            })))
                        })
                    }}
                    onRemove={removed => setFiles(s => s.filter(x => x.file != removed))}
                    accept="video/*,image/*,audio/*"
                    maxSize={8 * 1024 * 1024}
                    onMetadataChange={(file, metadata) => setFiles(s => {
                        const item = s.find(f => f.file == file)
                        if (item) {
                            item.metadata = metadata
                        }
                    })}
                    getMetadata={file => files().find(f => f.file === file)?.metadata}
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
                                    onClick={() => setEditing({m, i: i()})}
                                >
                                    <InfoIcon size={16} />
                                </button>
                                
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
                    label={`Developer ${game.developerName ? `(${game.developerName})` : ""}`}
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
            <Show when={editing()}>
                {(edit) =>
                    <MetadataEditor
                        onClose={() => setEditing(null)}
                        onSave={metadata => setGame(s => {
                            s.media[edit().i].metadata = metadata
                        })}
                        title={edit().m.key}
                        initial={edit().m.metadata}
                    />
                }
            </Show>
        </div>

    )
}