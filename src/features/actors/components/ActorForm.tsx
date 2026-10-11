import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { useServerFn } from "@tanstack/solid-start"
import { createStore, unwrap } from "solid-js/store"
import { useToastContext } from "~/hooks/useToastContext"
import { useUpload } from "~/hooks/useUpload"
import { createActorFn, editActorFn, getActorsWithCharacters } from "~/features/actors/actorsApi"
import { actorQueryOpts, actorsQueryOpts } from "../utils/actorQueryOpts"
import { Form } from "~/components/Forms/Form"
import { ContentEditable } from "~/components/Forms/ContentEditable"
import { UploadBoxWithPreview } from "~/components/UploadBox/UploadBoxWithPreview"
import { Optional } from "~/lib/utilityTypes"
import { useNavigate } from "@tanstack/solid-router"
import { getPeopleSignedUrls } from "~/integrations/storageService/serverFn"
import { CharacterEditor } from "~/components/CharacterEditor/CharacterEditor"

type Actor = Awaited<ReturnType<typeof getActorsWithCharacters>>
type Char = Actor['characters'][number]

export function ActorForm(props: { actor?: Omit<Actor, 'characters'> & { characters: Optional<Char, 'appearanceId'>[] } }) {
    const abortController = new AbortController
    const navigate = useNavigate()
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

    const { isUploading, setFiles, convertAndUpload } = useUpload(abortController)

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        const files = await convertAndUpload(getPeopleSignedUrls)
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
                queryClient.invalidateQueries(actorsQueryOpts());
                navigate({ to: "/admin/actors/$actorId/edit", params: { actorId: data.actorId } })
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
                    !actor.name ||
                    actor.characters.some(ch => !ch.character)
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
                    label="Photo"
                    onDrop={data => {
                        setActor({ photo: data.objectUrl })
                        setFiles(() => [{ ...data, field: "photo" }])
                    }}
                />
                <ContentEditable
                    html={actor.bio}
                    setter={bio => setActor({ bio })}
                    label="Bio"
                />
                <CharacterEditor
                    actor={props.actor ?? {actorId: 0, name: actor.name}}
                    appearances={props.actor?.characters.map(char => ({
                        ...char,
                        actorId: props.actor!.actorId,
                        actorName: props.actor!.name,
                        gameTitle: char.title
                    }))}
                    onChange={appearances => {
                        setActor({
                            characters: appearances.map(ap => ({
                                ...ap,
                                title:  ap.gameTitle
                            }))
                        })
                    }}

                />
            </Form>
        </div>
    )
}
