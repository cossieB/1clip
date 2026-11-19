
import * as api from "../platformsApi"
import { useUpload } from "~/hooks/useUpload";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { getLogoSignedUrls } from "~/integrations/storageService/serverFn";
import { createSignal, createStore, useContext } from "solid-js";
import { ToastContext } from "~/components/Toast/ToastProvider";
import { TextField } from "~/components/Forms/Textfield";
import { ImageUpload } from "~/components/Forms/ImageUpload";
import { AwaitedReturn } from "~/lib/utilityTypes";
import { useToastError } from "~/hooks/useToastError";
import styles from "./PlatformForm.module.css"

type Platform = Awaited<ReturnType<typeof api.getPlatformFn>>

export function PlatformForm(props: { platform?: Platform}) {
    const abortController = new AbortController
    const { addToast } = useContext(ToastContext)
    const toastError = useToastError()
    const [platform, setPlatform] = createStore(() => ({
        platformId: props.platform?.platformId,
        name: props.platform?.name ?? "",
        releaseDate: props.platform?.releaseDate,
        logo: props.platform?.logo ?? "",
        summary: props.platform?.summary ?? ""
    }))
    const { isUploading, setFiles, convertAndUpload } = useUpload(abortController)
    const [submitting, setSubmitting] = createSignal(false)

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        setSubmitting(true)
        try {
            const files: AwaitedReturn<typeof convertAndUpload> = await convertAndUpload(getLogoSignedUrls)
            const f = files.at(0)
            if (f) setPlatform(s => { s.logo = f.key })

            if (platform.platformId) {                
                const edited = await api.editPlatformFn({ ...platform, platformId: platform.platformId });
                setPlatform(() => edited)
                addToast({ text: "Successfully edited developer, " + platform.platformId, type: "info" })                
            }
            else {                
                await api.createPlatformFn(platform as any)
            }
        }
        catch (error) {
            toastError(error)
        }
        finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <form
                class={["form card", styles.form]}
                onSubmit={handleSubmit}
            >
                <TextField
                    label="Name"
                    onChange={e => setPlatform(s => { s.name = e.currentTarget.value })}
                    autocomplete="off"
                    value={platform.name}
                />
                <ImageUpload
                    setFile={(file, objectUrl) => {
                        setFiles(s => [{ file, field: "logo" }])
                        setPlatform(s => { s.logo = objectUrl })
                    }}
                    image={platform.logo}
                />

                <TextField
                    label="Release Date"
                    onChange={e => setPlatform(s => { s.releaseDate = e.currentTarget.value })}
                    value={platform.releaseDate ?? ""}
                    type="date"
                />

                <ContentEditable
                    html={platform.summary}
                    setter={summary => setPlatform(s => { s.summary = summary })}
                    label="Summary"
                />
                <button
                    type="submit"
                    disabled={
                        !platform.name ||
                        !platform.releaseDate ||
                        !platform.logo ||
                        !platform.summary ||
                        isUploading() ||
                        submitting()
                    }
                >
                    Submit
                </button>
            </form>
        </div>
    )
}

