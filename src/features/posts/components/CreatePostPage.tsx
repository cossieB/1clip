import { Show } from "solid-js";
import { Editor } from "~/components/Forms/Editor";
import { TextField } from "~/components/Forms/Textfield";
import { SearchAutocomplete } from "~/components/SearchAutocomplete/SearchAutocomplete";
import { getGamesFn } from "~/features/games/gamesApi";
import { useCreatePost } from "../hooks/useCreatePost";
import { DropZone } from "~/components/Forms/DropZone";
import { Spinner } from "~/components/Loader/Spinner";

export function CreatePostPage() {

    const { input, setInput, setFiles, handleSubmit, isSubmitting, abortController, files } = useCreatePost()
    return (
        <form onSubmit={handleSubmit} class="form card">
            <TextField
                label="Title" onChange={e => setInput(s => {
                    s.title = e.currentTarget.value.trim()
                })}
                required
                autocomplete="off"
            />
            <DropZone
                files={files().map(u => u.file)}
                onAdd={added => setFiles(s => {
                    s.push(...added.map(x => ({
                        file: x,
                        field: "media"
                    })))
                })}
                onRemove={file => setFiles(s => {
                    return s.filter(x => x.file != file)
                })}
                accept="video/mp4, video/webm, video/ogg, audio/mpeg, audio/wav, audio/ogg, audio/aac, audio/midi, audio/x-midi, audio/webm, image/jpeg, image/png, image/webp, image/gif"
                maxSize={8 * 1024 * 1024}
                maxFiles={4}
            />
            <Editor
                content={input.text}
                setContent={(val) => setInput(s => {s.text = val})}
                maxlength={500}
                placeholder="Add some detail"
            />
            <SearchAutocomplete
                search={str => getGamesFn({title: str})}
                getLabel={game => game.title}
                onSelect={game => {
                    setInput(s => {
                        s.game = game
                    })
                }}
                label="Game"
                noun="game"
            />
            <button
                class="primary"
                type="submit"
                disabled={isSubmitting() || !input.title || input.text.length + files().length === 0}
            >
                <Show when={isSubmitting()} fallback="Submit">
                    <Spinner size="small" />
                </Show>
            </button>
        </form>
    )
}