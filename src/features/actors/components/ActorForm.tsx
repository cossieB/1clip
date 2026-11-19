
import * as api from "../actorsApi"
import { useUpload } from "~/hooks/useUpload";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { getPeopleSignedUrls } from "~/integrations/storageService/serverFn";
import { createSignal, createStore, useContext } from "solid-js";
import { ToastContext } from "~/components/Toast/ToastProvider";
import { TextField } from "~/components/Forms/Textfield";
import { ImageUpload } from "~/components/Forms/ImageUpload";
import { AwaitedReturn, Optional } from "~/lib/utilityTypes";
import { useToastError } from "~/hooks/useToastError";
import styles from "./ActorForm.module.css"
import { CharacterEditor } from "~/components/CharacterEditor/CharacterEditor";

type Actor = NonNullable<Awaited<ReturnType<typeof api.getActorsWithCharactersFn>>>
type Char = Actor['characters'][number]

export function ActorForm(props: { actor?: Omit<Actor, 'characters'> & { characters: Optional<Char, 'appearanceId'>[] } }) {
    const abortController = new AbortController
    const { addToast } = useContext(ToastContext)
    const toastError = useToastError()
    const [actor, setActor] = createStore(() => ({
        ...props.actor,
    }))
    const { isUploading, setFiles, convertAndUpload } = useUpload(abortController)
    const [submitting, setSubmitting] = createSignal(false)

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        setSubmitting(true)
        try {
            const files: AwaitedReturn<typeof convertAndUpload> = await convertAndUpload(getPeopleSignedUrls)
            const f = files.at(0)
            if (f) setActor(s => { s.photo = f.key })

            if (actor.actorId) {
                const edited = await api.editActorFn({ ...actor, actorId: actor.actorId });
                setActor(() => edited)
                addToast({ text: "Successfully edited developer, " + actor.actorId, type: "info" })
            }
            else {
                await api.createActorFn(actor as any)
            }
        }
        catch (error) {
            toastError(error)
        }
        finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <form
                class={["form card", styles.form]}
                onSubmit={handleSubmit}
            >
                <TextField
                    label="Name"
                    onChange={e => setActor(s => { s.name = e.currentTarget.value })}
                    autocomplete="off"
                    value={actor.name}
                />
                <ImageUpload
                    setFile={(file, objectUrl) => {
                        setFiles(s => [{ file, field: "photo" }])
                        setActor(s => { s.photo = objectUrl })
                    }}
                    image={actor.photo}
                />

                <ContentEditable
                    html={actor.bio?? ""}
                    setter={bio => setActor(s => { s.bio = bio })}
                    label="Bio"
                />
                <CharacterEditor
                    actor={props.actor ?? { actorId: 0, name: actor.name! }}
                    appearances={props.actor?.characters.map(char => ({
                        ...char,
                        actorId: props.actor!.actorId,
                        actorName: props.actor!.name,
                        gameTitle: char.title
                    }))}
                    onChange={appearances => {
                        setActor(s => {
                            s.characters = appearances.map(ap => ({
                                ...ap,
                                gameId: ap.gameId!,
                                title: ap.gameTitle
                            }))
                        })
                    }}

                />
                <button
                    type="submit"
                    disabled={
                        !actor.name ||
                        !actor.photo ||
                        isUploading() ||
                        submitting()
                    }
                >
                    Submit
                </button>
            </form>
        </div>
    )
}

