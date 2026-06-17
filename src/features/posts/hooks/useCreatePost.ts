import { useQueryClient, useMutation } from "@tanstack/solid-query"
import { createStore } from "solid-js/store"
import { useGamesQuery } from "~/features/games/hooks/useGameQuery"
import { useAbortController } from "~/hooks/useAbortController"
import { useToastContext } from "~/hooks/useToastContext"
import { useUpload } from "~/hooks/useUpload"
import { postsQueryOpts } from "../utils/postQueryOpts"
import { useNavigate } from "@solidjs/router"
import { createPostFn } from "~/services/postService"

export function useCreatePost() {
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const result = useGamesQuery()

    const abortController = useAbortController();

    const { isUploading, setFiles, upload, files } = useUpload(["media"], abortController)

    const mutation = useMutation(() => ({
        mutationFn: createPostFn,
        
    }))

    const [input, setInput] = createStore({
        title: "",
        text: "",
        game: null as { gameId: number, title: string } | null,
        mode: "text" as "text" | "upload" | "Youtube / Twitch",
        link: "",
        tags: [] as string[],
    })

    async function handleSubmit(e: SubmitEvent) {
        const { game, ...rest } = input
        e.preventDefault();
        try {
            const uploadResult = await upload()
            mutation.mutate({
                ...rest,
                gameId: input.game?.gameId,
                media: uploadResult.map(f => ({
                    contentType: f.file.type,
                    key: f.key
                })),
            }, {
                onError(error, variables, onMutateResult, context) {
                    console.error(error)
                    addToast({ text: error.message, type: "error" })
                },
                onSuccess(response, variables) {
                    queryClient.invalidateQueries(postsQueryOpts())
                    navigate(`/posts/${response.postId}`)
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
        mutation,
        result,
        setFiles,
        files
    }
}