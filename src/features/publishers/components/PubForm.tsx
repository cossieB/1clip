import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useServerFn } from "@tanstack/solid-start";
import { createStore } from "solid-js/store";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { Form } from "~/components/Forms/Form";
import { useToastContext } from "~/hooks/useToastContext";
import { useUpload } from "~/hooks/useUpload";
import { countryList } from "~/utils/countryList";
import { publisherQueryOpts, publishersQueryOpts } from "../utils/publisherQueryOpts";
import { UploadBoxWithPreview } from "~/components/UploadBox/UploadBoxWithPreview";
import { getPublisherFn, createPublisherFn, editPublisherFn } from "../publishersApi";
import { Show } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";

type Publisher = Awaited<ReturnType<typeof getPublisherFn>>

export function PubForm(props: { publisher?: Publisher }) {
    const navigate = useNavigate()
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()

    const createPubMutation = useMutation(() => ({
        mutationFn: useServerFn(createPublisherFn)
    }))

    const editPubMutation = useMutation(() => ({
        mutationFn: useServerFn(editPublisherFn)
    }))

    const [publisher, setPublisher] = createStore(props.publisher ?? {
        name: "",
        country: "",
        headquarters: "",
        logo: "",
        summary: ""
    })

    const { isUploading, setFiles, upload, files } = useUpload()

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()

        if ('publisherId' in publisher) {
            try {
                const f = files().at(0);
                const file = f ? { size: f.file.size, contentType: f.file.type, filename: f.file.name } : undefined
                const r2details = await editPubMutation.mutateAsync({ data: { ...publisher, file } });
                if (r2details) {
                    await upload([r2details.signedUrl])
                    setPublisher({ logo: r2details.key })
                }
                addToast({ text: "Successfully edited actor, " + publisher.publisherId, type: "info" })
                queryClient.setQueryData(publisherQueryOpts(publisher.publisherId).queryKey, publisher)
                queryClient.invalidateQueries(publishersQueryOpts())
            }
            catch (error) {
                addToast({ text: "Failed", type: "error" });
                console.error(error)
            }
            finally {
                return;
            }
        }
        createPubMutation.mutate({ data: publisher }, {
            onSuccess(data, variables, onMutateResult, context) {
                addToast({ text: "Successfully created actor, " + data.publisherId, type: "info" })
                queryClient.setQueryData(publisherQueryOpts(data.publisherId).queryKey, data)
                queryClient.invalidateQueries(publishersQueryOpts())
                navigate({ to: "/admin/actors/$actorId", params: { actorId: data.publisherId } })
            },
            onError(error, variables, onMutateResult, context) {
                addToast({ text: error.message, type: "error" })
            },
        })
    }

    return (
        <div >
            <Form
                isPending={isUploading() || createPubMutation.isPending || editPubMutation.isPending}
                disabled={
                    !publisher.name ||
                    !publisher.country ||
                    !publisher.headquarters ||
                    !publisher.summary
                }
                onSubmit={handleSubmit}
            >
                <Form.Input<typeof publisher>
                    field="name"
                    setter={name => setPublisher({ name })}
                    value={publisher.name}
                />
                <Show when={props.publisher}>
                    <UploadBoxWithPreview
                        image={publisher.logo ?? "/q.png"}
                        label="Logo"
                        onDrop={data => {
                            setPublisher({ logo: data.objectUrl })
                            setFiles(() => [{ ...data, field: "logo" }])
                        }}
                    />
                </Show>
                <Form.FormSelect
                    list={countryList}
                    selected={publisher.country}
                    setSelected={country => setPublisher({ country })}
                />
                <Form.Input<typeof publisher>
                    field="headquarters"
                    setter={headquarters => setPublisher({ headquarters })}
                    value={publisher.headquarters ?? ""}
                />
                <ContentEditable
                    html={publisher.summary}
                    setter={summary => setPublisher({ summary })}
                    label="Summary"
                />
            </Form>
        </div>
    )

}