import { useQueryClient, useMutation } from "@tanstack/solid-query"
import { useNavigate } from "@tanstack/solid-router"
import { useServerFn } from "@tanstack/solid-start"
import { createStore } from "solid-js/store"
import { useGamesQuery } from "~/features/games/hooks/useGameQuery"
import { useAbortController } from "~/hooks/useAbortController"
import { useUpload } from "~/hooks/useUpload"
import { createPostFn, markPostUploadComplete } from "~/features/posts/postsApi"
import { postQueryOpts, postsQueryOpts } from "../utils/postQueryOpts"

export function useCreatePost() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const result = useGamesQuery()
    
    const abortController = useAbortController();
    
    const { isUploading, setFiles, upload, files } = useUpload()
    const createAction = useServerFn(createPostFn)

    const mutation = useMutation(() => ({
        mutationFn: createAction
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
            const response = await mutation.mutateAsync({
                data: {
                    ...rest,
                    gameId: input.game?.gameId,
                    media: files().map(f => ({
                        contentType: f.file.type,
                        filename: f.file.name,
                        size: f.file.size,
                    })),
                },
                signal: abortController.signal
            })
            void queryClient.invalidateQueries(postsQueryOpts())            
            if (response.post.pending) {
                await upload(response.urls.map(x => x.signedUrl), abortController)
                const p = await markPostUploadComplete({data: response.post.postId});
                queryClient.setQueryData(postQueryOpts(p.postId).queryKey, p)
            } 
            navigate({ to: "/posts/$postId", params: { postId: response.post.postId } })
        }
        catch (error) {
            console.error(error)            
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