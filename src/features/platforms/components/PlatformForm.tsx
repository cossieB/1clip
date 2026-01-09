import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { useServerFn } from "@tanstack/solid-start"
import { createStore } from "solid-js/store"
import { useToastContext } from "~/hooks/useToastContext"
import { useUpload } from "~/hooks/useUpload"
import { createPlatformFn, editPlatformFn, getPlatformFn } from "~/serverFn/platforms"
import { platformQueryOpts } from "../utils/platformQueryOpts"
import { Form } from "~/components/Forms/Form"
import { ContentEditable } from "~/components/Forms/ContentEditable"
import { UploadBoxWithPreview } from "~/components/UploadBox/UploadBoxWithPreview"

type Platform = Awaited<ReturnType<typeof getPlatformFn>>

export function PlatformForm(props: { platform?: Platform }) {
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()

    const createPlatformMutation = useMutation(() => ({
        mutationFn: useServerFn(createPlatformFn)
    }))

    const editPlatformMutation = useMutation(() => ({
        mutationFn: useServerFn(editPlatformFn)
    }))

    const [platform, setPlatform] = createStore(props.platform ?? {
        name: "",
        logo: "",
        releaseDate: "",
        summary: ""
    })

    const { isUploading, setFiles, upload } = useUpload(["logos"])

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        const files = await upload()
        const f = files.at(0)
        if (f) setPlatform({ logo: f.key })
        if ('platformId' in platform) {
            return editPlatformMutation.mutate({ data: platform }, {
                onSuccess(data, variables, onMutateResult, context) {
                    addToast({ text: "Successfully edited platform, " + platform.platformId, type: "info" })
                    queryClient.setQueryData(platformQueryOpts(platform.platformId).queryKey, platform)
                },
                onError(error, variables, onMutateResult, context) {
                    addToast({ text: "Failed", type: "error" })
                },
            })
        }
        createPlatformMutation.mutate({ data: platform }, {
            onSuccess(data, variables, onMutateResult, context) {
                addToast({ text: "Successfully created platform, " + data.platformId, type: "info" })
                queryClient.setQueryData(platformQueryOpts(data.platformId).queryKey, data)
            },
            onError(error, variables, onMutateResult, context) {
                addToast({ text: "Failed", type: "error" })
            },
        })
    }

    return (
        <div >
            <Form
                isPending={isUploading() || createPlatformMutation.isPending || editPlatformMutation.isPending}
                disabled={
                    !platform.name ||
                    !platform.logo ||
                    !platform.releaseDate
                }
                onSubmit={handleSubmit}
            >
                <Form.Input<typeof platform>
                    field="name"
                    setter={name => setPlatform({ name })}
                    value={platform.name}
                />
                <UploadBoxWithPreview
                    image={platform.logo}
                    onDrop={data => {
                        setPlatform({ logo: data.objectUrl })
                        setFiles([{ ...data, field: "logo" }])
                    }}
                />
                <ContentEditable
                    html={platform.summary}
                    setter={summary => setPlatform({ summary })}
                />
            </Form>
        </div>
    )

}