import { useQueryClient, useMutation } from "@tanstack/solid-query"
import { useNavigate } from "@tanstack/solid-router"
import { useServerFn } from "@tanstack/solid-start"
import { createSignal } from "solid-js"
import { createStore } from "solid-js/store"
import { useGamesQuery } from "~/features/games/hooks/useGameQuery"
import { useAbortController } from "~/hooks/useAbortController"
import { useToastContext } from "~/hooks/useToastContext"
import { useUpload } from "~/hooks/useUpload"
import { createPostFn } from "~/serverFn/posts"
import { postsQueryOpts } from "../utils/postQueryOpts"

export function useCreatePost() {
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const result = useGamesQuery()
    
    const abortController = useAbortController()

    const { isUploading, setFiles, upload } = useUpload(["media"], abortController)
    const createAction = useServerFn(createPostFn)

    const mutation = useMutation(() => ({
        mutationFn: createAction
    }))

    const [input, setInput] = createStore({
        title: "",
        text: "",
        media: [] as string[],
        game: null as { gameId: number, title: string } | null,
        tags: [] as string[],
    })
    
    const [preview, setPreview] = createSignal("")

    async function handleSubmit(e: SubmitEvent) {
        const { game, ...rest } = input
        e.preventDefault();
        try {
            const uploadResult = await upload()
            mutation.mutate({
                data: {
                    ...rest,
                    gameId: input.game?.gameId,
                    media: uploadResult.map(f => ({
                        contentType: f.file.type,
                        key: f.key
                    })),
                },
                signal: abortController.signal
            }, {
                onError(error, variables, onMutateResult, context) {
                    console.error(error)
                    addToast({ text: error.message, type: "error" })
                },
                onSuccess(response, variables) {
                    queryClient.invalidateQueries(postsQueryOpts())
                    navigate({ to: "/posts/$postId", params: { postId: response.postId } })
                },
            })
        }
        catch (error) {
            addToast({ text: "Something went wrong. Please try again later", type: "error" })
        }
    }

    return {
        input,
        setInput,
        handleSubmit,
        isUploading,
        abortController,
        setPreview,
        mutation,
        preview,
        result,
        setFiles
    }
}