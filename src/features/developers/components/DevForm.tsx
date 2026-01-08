import { createStore } from "solid-js/store";
import { Form } from "~/components/Forms/Form";
import { UploadBox } from "~/components/UploadBox/UploadBox";
import { createDeveloperFn, editDeveloperFn, type getDeveloperFn } from "~/serverFn/developers";
import { useUpload } from "~/hooks/useUpload";
import { countryList } from "~/utils/countryList";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { STORAGE_DOMAIN } from "~/utils/env";
import { useServerFn } from "@tanstack/solid-start";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import styles from "./DevForm.module.css"
import { useToastContext } from "~/hooks/useToastContext";
import { developerQueryOpts } from "../utils/developerQueryOpts";

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
                addToast({ text: "Failed", type: "error" })
            },
        })
    }


    return (
        <div class={styles.container}>

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
                <div class={styles.upload}>
                    <UploadBox
                        accept={{
                            image: true,
                            video: false,
                            audio: false
                        }}
                        label="Logo"
                        limit={1}
                        maxSize={5}
                        onSuccess={data => {
                            const a = data[0]
                            setDeveloper({ logo: a.objectUrl })
                            setFiles([{ ...a, field: "logo" }])
                        }}
                    />
                    <div class={styles.preview}>
                        <img src={mediaSrc(developer.logo)} />
                    </div>
                </div>
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
                />
            </Form>
        </div>
    )
}

export const mediaSrc = (src: string) => src.startsWith("blob:") ? src : STORAGE_DOMAIN + src