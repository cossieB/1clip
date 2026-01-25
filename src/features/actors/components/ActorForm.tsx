import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { useServerFn } from "@tanstack/solid-start"
import { createStore, unwrap } from "solid-js/store"
import { useToastContext } from "~/hooks/useToastContext"
import { useUpload } from "~/hooks/useUpload"
import { createActorFn, editActorFn, getActorsWithCharacters } from "~/serverFn/actors"
import { actorQueryOpts, actorsQueryOpts } from "../utils/actorQueryOpts"
import { Form } from "~/components/Forms/Form"
import { ContentEditable } from "~/components/Forms/ContentEditable"
import { UploadBoxWithPreview } from "~/components/UploadBox/UploadBoxWithPreview"
import { For } from "solid-js"
import { AsyncSelect } from "~/components/Forms/AsyncSelect"
import { gamesQueryOpts } from "~/features/games/utils/gameQueryOpts"
import { StandaloneInput } from "~/components/Forms/FormInput"
import { FormSelect } from "~/components/Forms/Select"
import styles from "./ActorForm.module.css"
import { CirclePlusIcon, Trash2Icon } from "lucide-solid"
import { Optional } from "~/lib/utilityTypes"

type Actor = Awaited<ReturnType<typeof getActorsWithCharacters>>
type Char = Actor['characters'][number]

export function ActorForm(props: { actor?: Omit<Actor, 'characters'> & { characters: Optional<Char, 'appearanceId'>[] } }) {

    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    const createActorMutation = useMutation(() => ({
        mutationFn: useServerFn(createActorFn)
    }))
    const editActorMutation = useMutation(() => ({
        mutationFn: useServerFn(editActorFn)
    }))
    const [actor, setActor] = createStore(props.actor ?? {
        name: "",
        bio: "",
        photo: "",
        characters: [] as Optional<Char, 'appearanceId'>[],
    })

    const { isUploading, setFiles, upload } = useUpload(["people"])

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        const files = await upload()
        const f = files.at(0)
        if (f) setActor({ photo: f.key })
        if ('actorId' in actor) {
            return editActorMutation.mutate({ data: actor }, {
                onSuccess(data, variables, onMutateResult, context) {
                    addToast({ text: "Successfully edited actor, " + actor.actorId, type: "info" })
                    queryClient.setQueryData(actorQueryOpts(actor.actorId).queryKey, actor)
                    queryClient.invalidateQueries(actorsQueryOpts())
                },
                onError(error, variables, onMutateResult, context) {
                    addToast({ text: "Failed", type: "error" })
                },
            })
        }
        createActorMutation.mutate({ data: actor }, {
            onSuccess(data, variables, onMutateResult, context) {
                addToast({ text: "Successfully created actor, " + data.actorId, type: "info" })
                queryClient.setQueryData(actorQueryOpts(data.actorId).queryKey, data)
                queryClient.invalidateQueries(actorsQueryOpts())
            },
            onError(error, variables, onMutateResult, context) {
                addToast({ text: error.message, type: "error" })
            },
        })
    }

    return (
        <div>
            <Form
                isPending={isUploading() || createActorMutation.isPending || editActorMutation.isPending}
                disabled={
                    !actor.name
                }
                onSubmit={handleSubmit}
            >
                <Form.Input<typeof actor>
                    field="name"
                    setter={name => setActor({ name })}
                    value={actor.name}
                />
                <UploadBoxWithPreview
                    image={actor.photo ?? "/q.png"}
                    onDrop={data => {
                        setActor({ photo: data.objectUrl })
                        setFiles([{ ...data, field: "photo" }])
                    }}
                />
                <ContentEditable
                    html={actor.bio}
                    setter={bio => setActor({ bio })}
                    label="Bio"
                />
                <NewCharacter
                    handleAdd={char => setActor('characters', prev => [...prev, char])}
                />
                <ul class={styles.charlist}>
                    <For each={actor.characters}>
                        {char =>
                            <li  >
                                <div> {char.title} </div>
                                <div> {char.character} </div>
                                <div> {char.roleType} </div>
                                <button
                                    class={styles.button}
                                    type="button"
                                    onclick={() => setActor('characters', prev => prev.filter(x => x.gameId != char.gameId))}
                                >
                                    <Trash2Icon />
                                </button>
                            </li>
                        }
                    </For>
                </ul>
            </Form>
        </div>
    )
}

type P = {
    handleAdd: (char: {
        gameId: number,
        title: string,
        character: string,
        roleType: Char['roleType']
    }) => void
}

function NewCharacter(props: P) {
    const [state, setState] = createStore({
        gameId: -1,
        character: "",
        title: "",
        roleType: "major character" as Char['roleType']
    })
    return (
        <div class={styles.new}>
            <AsyncSelect
                //@ts-expect-error
                queryOptions={gamesQueryOpts()}
                field=""
                getLabel={game => game.title}
                getValue={game => game.gameId}
                selected={state.gameId}
                setSelected={game => setState({ gameId: game.gameId, title: game.title })}
            />
            <StandaloneInput
                field=""
                setter={character => setState({ character })}
                value={state.character}
            />
            <FormSelect
                list={['player character', 'major character', 'minor character']}
                selected={state.roleType}
                setSelected={role => setState({ roleType: role as Char['roleType'] })}
            />
            <button
                type="button"
                disabled={
                    state.gameId == -1 ||
                    !state.character
                }
                onClick={() => {
                    props.handleAdd({ ...state });
                    setState({
                        gameId: -1,
                        character: "",
                        title: "",
                        roleType: "major character" as Char['roleType']
                    })
                }}
            >
                <CirclePlusIcon />
            </button>
        </div>
    )
}