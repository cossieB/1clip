
import { useAbortController } from "~/hooks/useAbortController"
import { useUpload } from "~/hooks/useUpload"
import { createPostFn, markPostUploadComplete } from "~/features/posts/postsApi"
import { action, createOptimistic, createStore, useContext } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { paths } from "~/router"
import { AwaitedReturn } from "~/lib/utilityTypes"
import { ToastContext } from "~/components/Toast/ToastProvider"

export function useCreatePost() {
    const navigate = useNavigate()
    const { addToast } = useContext(ToastContext)
    const abortController = useAbortController();
    const [isSubmitting, setIsSubmitting] = createOptimistic(false)
    const { setFiles, upload, files, convertFiles } = useUpload(abortController)

    const [input, setInput] = createStore({
        title: "",
        text: "",
        game: null as { gameId: number, title: string } | null,
        mode: "text" as "text" | "upload" | "Youtube / Twitch",
    })

    const send = action(function* () {
        try {
            setIsSubmitting(true)
            yield convertFiles()
            const response: AwaitedReturn<typeof createPostFn> = yield createPostFn({
                text: input.text,
                title: input.title,
                gameId: input.game?.gameId,
                media: files().map(f => ({
                    contentType: (f.convertedFile ?? f.file).type,
                    filename: (f.convertedFile ?? f.file).name,
                    size: (f.convertedFile ?? f.file).size,
                })),
            })
            if (response.post.pending) {
                yield upload(response.urls)
                yield markPostUploadComplete(response.post.postId)
            }
            navigate(paths.posts(response.post.postId))
        }
        catch (error) {
            addToast({
                text: error instanceof Error && error.message
                    ? error.message
                    : "Something went wrong. Please try again later.",
                type: "error"
            })
        }
    })

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        await send()
    }

    return {
        input,
        setInput,
        handleSubmit,
        isSubmitting,
        abortController,
        setFiles,
        files
    }
}