import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { createStore } from "solid-js/store";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { Form } from "~/components/Forms/Form";
import { useToastContext } from "~/hooks/useToastContext";
import { useUpload } from "~/hooks/useUpload";
import { createPublisherFn, editPublisherFn, getPublisherFn } from "~/services/publisherService";
import { countryList } from "~/utils/countryList";
import { mediaSrc } from "~/utils/mediaSrc";
import { publisherQueryOpts, publishersQueryOpts } from "../utils/publisherQueryOpts";
import { UploadBoxWithPreview } from "~/components/UploadBox/UploadBoxWithPreview";

type Publisher = Awaited<ReturnType<typeof getPublisherFn>>

export function PubForm(props: { publisher?: Publisher }) {
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()

    const createPubMutation = useMutation(() => ({
        mutationFn: createPublisherFn
    }))

    const editPubMutation = useMutation(() => ({
        mutationFn: editPublisherFn
    }))

    const [publisher, setPublisher] = createStore(props.publisher ?? {
        name: "",
        country: "",
        headquarters: "",
        logo: "",
        summary: ""
    })

    const { isUploading, setFiles, upload } = useUpload(["logos"])

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        const files = await upload()
        const f = files.at(0)
        if (f) setPublisher({ logo: f.key })
        if ('publisherId' in publisher) {
            return editPubMutation.mutate(publisher, {
                onSuccess(data, variables, onMutateResult, context) {
                    addToast({ text: "Successfully edited publisher, " + publisher.publisherId, type: "info" })
                    queryClient.setQueryData(publisherQueryOpts(publisher.publisherId).queryKey, publisher)
                    queryClient.invalidateQueries(publishersQueryOpts())
                },
                onError(error, variables, onMutateResult, context) {
                    addToast({ text: "Failed", type: "error" })
                },
            })
        }
        createPubMutation.mutate(publisher, {
            onSuccess(data, variables, onMutateResult, context) {
                addToast({ text: "Successfully created publisher, " + data.publisherId, type: "info" })
                queryClient.setQueryData(publisherQueryOpts(data.publisherId).queryKey, data)
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
                    !publisher.logo ||
                    !publisher.summary
                }
                onSubmit={handleSubmit}
            >
                <Form.Input<typeof publisher>
                    field="name"
                    setter={name => setPublisher({ name })}
                    value={publisher.name}
                />
                <UploadBoxWithPreview
                    image={publisher.logo}
                    onDrop={data => {
                        setPublisher({ logo: data.objectUrl })
                        setFiles([{ ...data, field: "logo" }])
                    }}
                />
                <Form.FormSelect
                    list={countryList}
                    selected={publisher.country}
                    setSelected={country => setPublisher({country})}
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