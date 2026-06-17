import { createStore } from "solid-js/store";
import { Form } from "~/components/Forms/Form";
import { useUpload } from "~/hooks/useUpload";
import { countryList } from "~/utils/countryList";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useToastContext } from "~/hooks/useToastContext";
import { developerQueryOpts, developersQueryOpts } from "../utils/developerQueryOpts";
import { UploadBoxWithPreview } from "~/components/UploadBox/UploadBoxWithPreview";
import { createDeveloperFn, editDeveloperFn, getDeveloperFn } from "~/services/developerService";

type Developer = Awaited<ReturnType<typeof getDeveloperFn>>

export function DevForm(props: { developer?: Developer }) {
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    const createDevMutation = useMutation(() => ({
        mutationFn: createDeveloperFn
    }))
    const editDevMutation = useMutation(() => ({
        mutationFn: editDeveloperFn
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
            return editDevMutation.mutate( developer , {
                onSuccess(data, variables, onMutateResult, context) {
                    addToast({ text: "Successfully edited developer, " + developer.developerId, type: "info" })
                    queryClient.setQueryData(developerQueryOpts(developer.developerId).queryKey, developer)
                    queryClient.invalidateQueries(developersQueryOpts())
                },
                onError(error, variables, onMutateResult, context) {
                    addToast({ text: "Failed", type: "error" })
                },
            })
        }
        createDevMutation.mutate( developer , {
            onSuccess(data, variables, onMutateResult, context) {
                addToast({ text: "Successfully created developer, " + data.developerId, type: "info" })
                queryClient.setQueryData(developerQueryOpts(data.developerId).queryKey, data)
                queryClient.invalidateQueries(developersQueryOpts())
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

