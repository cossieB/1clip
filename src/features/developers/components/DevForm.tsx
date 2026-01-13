import { createStore } from "solid-js/store";
import { Form } from "~/components/Forms/Form";
import { createDeveloperFn, editDeveloperFn, type getDeveloperFn } from "~/serverFn/developers";
import { useUpload } from "~/hooks/useUpload";
import { countryList } from "~/utils/countryList";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { useServerFn } from "@tanstack/solid-start";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToastContext } from "~/hooks/useToastContext";
import { developerQueryOpts } from "../utils/developerQueryOpts";
import { UploadBoxWithPreview } from "~/components/UploadBox/UploadBoxWithPreview";

type Developer = Awaited<ReturnType<typeof getDeveloperFn>>

export function DevForm(props: { developer?: Developer }) {
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
    const { isUploading, setFiles, upload } = useUpload(["logos"])

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        const files = await upload()
        const f = files.at(0)
        if (f) setDeveloper({ logo: f.key })
        if ('developerId' in developer) {
            return editDevMutation.mutate({ data: developer }, {
                onSuccess(data, variables, onMutateResult, context) {
                    addToast({ text: "Successfully edited developer, " + developer.developerId, type: "info" })
                    queryClient.setQueryData(developerQueryOpts(developer.developerId).queryKey, developer)
                },
                onError(error, variables, onMutateResult, context) {
                    addToast({ text: "Failed", type: "error" })
                },
            })
        }
        createDevMutation.mutate({ data: developer }, {
            onSuccess(data, variables, onMutateResult, context) {
                addToast({ text: "Successfully created developer, " + data.developerId, type: "info" })
                queryClient.setQueryData(developerQueryOpts(data.developerId).queryKey, data)
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
                    !developer.logo ||
                    !developer.summary
                }
                onSubmit={handleSubmit}
            >
                <Form.Input<typeof developer>
                    field="name"
                    setter={name => setDeveloper({ name })}
                    value={developer.name}
                />
                <UploadBoxWithPreview
                    image={developer.logo}
                    onDrop={data => {
                        setDeveloper({ logo: data.objectUrl })
                        setFiles([{ ...data, field: "logo" }])
                    }}
                />
                <Form.FormSelect
                    field={"country"}
                    list={countryList}
                    required
                    selected={developer.country}
                    setter={val => setDeveloper({ country: val?.value as string | undefined })}
                    label="Country"
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

