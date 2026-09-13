import { createStore } from "solid-js/store";
import { Form } from "~/components/Forms/Form";
import { useUpload } from "~/hooks/useUpload";
import { countryList } from "~/utils/countryList";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { useServerFn } from "@tanstack/solid-start";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToastContext } from "~/hooks/useToastContext";
import { developerQueryOpts, developersQueryOpts } from "../utils/developerQueryOpts";
import { UploadBoxWithPreview } from "~/components/UploadBox/UploadBoxWithPreview";
import { getDeveloperFn, createDeveloperFn, editDeveloperFn } from "../developersApi";
import { Show } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";

type Developer = Awaited<ReturnType<typeof getDeveloperFn>>

export function DevForm(props: { developer?: Developer }) {
    const navigate = useNavigate()
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    const createDevMutation = useMutation(() => ({
        mutationFn: useServerFn(createDeveloperFn)
    }))
    const editDevMutation = useMutation(() => ({
        mutationFn: useServerFn(editDeveloperFn)
    }))
    const [developer, setDeveloper] = createStore(props.developer ?? {
        name: "",
        country: "",
        location: "",
        logo: "",
        summary: ""
    })
    const { isUploading, setFiles, upload, files } = useUpload()

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()

        if ('developerId' in developer) {
            try {
                const f = files().at(0);
                const file = f ? { size: f.file.size, contentType: f.file.type, filename: f.file.name } : undefined
                const r2details = await editDevMutation.mutateAsync({ data: { ...developer, file } });
                if (r2details) {
                    await upload([r2details.signedUrl])
                    setDeveloper({ logo: r2details.key })
                }
                addToast({ text: "Successfully edited actor, " + developer.developerId, type: "info" })
                queryClient.setQueryData(developerQueryOpts(developer.developerId).queryKey, developer)
                queryClient.invalidateQueries(developersQueryOpts())
            }
            catch (error) {
                addToast({ text: "Failed", type: "error" });
                console.error(error)
            }
            finally {
                return;
            }
        }
        createDevMutation.mutate({ data: developer }, {
            onSuccess(data, variables, onMutateResult, context) {
                addToast({ text: "Successfully created actor, " + data.developerId, type: "info" })
                queryClient.setQueryData(developerQueryOpts(data.developerId).queryKey, data)
                queryClient.invalidateQueries(developersQueryOpts())
                navigate({ to: "/admin/actors/$actorId", params: { actorId: data.developerId } })
            },
            onError(error, variables, onMutateResult, context) {
                addToast({ text: error.message, type: "error" })
            },
        })
    }

    return (
        <div>
            <Form
                isPending={isUploading() || createDevMutation.isPending || editDevMutation.isPending}
                disabled={
                    !developer.name ||
                    !developer.country ||
                    !developer.location ||
                    !developer.summary
                }
                onSubmit={handleSubmit}
            >
                <Form.Input<typeof developer>
                    field="name"
                    setter={name => setDeveloper({ name })}
                    value={developer.name}
                />
                <Show when={props.developer}>
                    <UploadBoxWithPreview
                        image={developer.logo ?? "/q.png"}
                        label="Logo"
                        onDrop={data => {
                            setDeveloper({ logo: data.objectUrl })
                            setFiles(() => [{ ...data, field: "logo" }])
                        }}
                    />
                </Show>
                <Form.FormSelect
                    list={countryList}
                    selected={developer.country}
                    setSelected={country => setDeveloper({ country })}
                />
                <Form.Input<typeof developer>
                    field="location"
                    setter={location => setDeveloper({ location })}
                    value={developer.location ?? ""}
                />
                <ContentEditable
                    html={developer.summary}
                    setter={summary => setDeveloper({ summary })}
                    label="Summary"
                />
            </Form>
        </div>
    )
}

