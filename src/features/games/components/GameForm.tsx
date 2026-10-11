import { Form } from "~/components/Forms/Form";
import { UploadBox } from "~/components/UploadBox/UploadBox";
import { For, Index, Show } from "solid-js";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { mediaSrc } from "~/utils/mediaSrc";
import { AsyncSelect } from "~/components/Forms/AsyncSelect";
import { developersQueryOpts } from "~/features/developers/utils/developerQueryOpts";
import { publishersQueryOpts } from "~/features/publishers/utils/publisherQueryOpts";
import { ImagePreview } from "~/features/games/components/ImagePreview";
import { AsyncChecklist } from "~/components/Forms/AsyncChecklist";
import { platformsQueryOpts } from "~/features/platforms/utils/platformQueryOpts";
import { Game, MediaField, useGameForm } from "../hooks/useGameForm";
import styles from "./GameForm.module.css"
import { IframeFactory } from "~/components/embeds/IframeFactory";
import { produce } from "solid-js/store";
import { TagSelector } from "./TagSelector";
import { SearchAutocomplete } from "~/components/SearchAutocomplete/SearchAutocomplete";
import { searchDevsFn } from "~/features/developers/developersApi";
import { searchPubsFn } from "~/features/publishers/publishersApi";

export function GameForm(props: { game?: Game }) {
    const {
        game,
        setGame,
        isUploading,
        createGameMutation,
        editGameMutation,
        files,
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
                !game.releaseDate ||
                !game.trailer ||
                game.platforms.length == 0
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
                        setFiles(prev => [
                            ...prev.filter(x => x.field != MediaField.Cover),
                            { ...file, field: MediaField.Cover }
                        ])
                    }}
                    maxSize={4}
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
                        setFiles(prev => [
                            ...prev.filter(x => x.field != MediaField.Banner),
                            { ...file, field: MediaField.Banner }
                        ])
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
                    label="Media"
                    onSuccess={async files => {
                        setGame('media', prev => [
                            ...prev,
                            ...files.map(x => ({
                                key: x.objectUrl,
                                contentType: x.file.type,
                                metadata: {}
                            }))
                        ])
                        setFiles(prev => [
                            ...prev,
                            ...files.map(f => ({ ...f, field: MediaField.Media }))
                        ])
                    }}
                    accept={{
                        image: true,
                        video: true,
                        audio: true
                    }}
                    limit={Infinity}
                    maxSize={8}
                />
            </div>
            <div class={styles.screenshots}>
                <For each={game.media}>
                    {(m, i) =>
                        <ImagePreview
                            contentType={m.contentType}
                            metadata={m.metadata}
                            url={mediaSrc(m.key)}
                            onDelete={() => {
                                setGame('media', prev => prev.filter(f => f.key != m.key))
                                setFiles(prev => prev.filter(a => a.objectUrl != m.key))
                            }}
                            setMetadata={metadata => {
                                setGame('media', i(), prev => ({ ...prev, metadata }));
                                if (files()[i()])
                                    setFiles(produce(prev => {
                                        prev[i()].metadata = metadata
                                    }))
                            }}
                        />
                    }
                </For>
            </div>
            <div >
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
            <SearchAutocomplete
                queryKey="searchDevs"
                label="Developer"
                search={input => searchDevsFn({ data: input })}
                getLabel={dev => dev.name}
                noun="developer"
                onSelect={dev => setGame({ developerId: dev.developerId })}
                debounceMs={500}
            />
            <SearchAutocomplete
                label="Publisher"
                queryKey="searchPubs"
                search={input => searchPubsFn({ data: input })}
                getLabel={item => item.name}
                onSelect={pub => setGame({ publisherId: pub.publisherId })}
                noun="publisher"
                debounceMs={500}
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
                <IframeFactory link={game.trailer!} />
            </Show>
            <TagSelector
                genres={game.genres}
                onUpdate={genres => setGame({ genres })}
            />
        </Form>
    )
}

