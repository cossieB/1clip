import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { useServerFn } from "@tanstack/solid-start"
import { createStore } from "solid-js/store"
import { useToastContext } from "~/hooks/useToastContext"
import { useUpload } from "~/hooks/useUpload"
import { platformQueryOpts, platformsQueryOpts } from "../utils/platformQueryOpts"
import { Form } from "~/components/Forms/Form"
import { ContentEditable } from "~/components/Forms/ContentEditable"
import { UploadBoxWithPreview } from "~/components/UploadBox/UploadBoxWithPreview"
import { getPlatformFn, createPlatformFn, editPlatformFn } from "../platformsApi"
import { Show } from "solid-js"
import { useNavigate } from "@tanstack/solid-router"

type Platform = Awaited<ReturnType<typeof getPlatformFn>>

export function PlatformForm(props: { platform?: Platform }) {
    const navigate = useNavigate()
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

    const { isUploading, setFiles, upload, files } = useUpload()

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()

        if ('platformId' in platform) {
            try {
                const f = files().at(0);
                const file = f ? { size: f.file.size, contentType: f.file.type, filename: f.file.name } : undefined
                const r2details = await editPlatformMutation.mutateAsync({ data: { ...platform, file } });
                if (r2details) {
                    await upload([r2details.signedUrl])
                    setPlatform({ logo: r2details.key })
                }
                addToast({ text: "Successfully edited actor, " + platform.platformId, type: "info" })
                queryClient.setQueryData(platformQueryOpts(platform.platformId).queryKey, platform)
                queryClient.invalidateQueries(platformsQueryOpts())
            }
            catch (error) {
                addToast({ text: "Failed", type: "error" });
                console.error(error)
            }
            finally {
                return;
            }
        }
        createPlatformMutation.mutate({ data: platform }, {
            onSuccess(data, variables, onMutateResult, context) {
                addToast({ text: "Successfully created actor, " + data.platformId, type: "info" })
                queryClient.setQueryData(platformQueryOpts(data.platformId).queryKey, data)
                queryClient.invalidateQueries(platformsQueryOpts())
                navigate({ to: "/admin/actors/$actorId", params: { actorId: data.platformId } })
            },
            onError(error, variables, onMutateResult, context) {
                addToast({ text: error.message, type: "error" })
            },
        })
    }

    return (
        <div >
            <Form
                isPending={isUploading() || createPlatformMutation.isPending || editPlatformMutation.isPending}
                disabled={
                    !platform.name ||
                    !platform.releaseDate
                }
                onSubmit={handleSubmit}
            >
                <Form.Input<typeof platform>
                    field="name"
                    setter={name => setPlatform({ name })}
                    value={platform.name}
                />
                <Show when={props.platform}>
                    <UploadBoxWithPreview
                        image={platform.logo ?? "/q.png"}
                        label="Logo"
                        onDrop={data => {
                            setPlatform({ logo: data.objectUrl })
                            setFiles(() => [{ ...data, field: "logo" }])
                        }}
                    />
                </Show>
                <ContentEditable
                    html={platform.summary}
                    setter={summary => setPlatform({ summary })}
                    label="Summary"
                />
                <Form.Input
                    field={"releaseDate"}
                    setter={releaseDate => setPlatform({ releaseDate })}
                    value={platform.releaseDate}
                    type="date"
                />
            </Form>
        </div>
    )
}