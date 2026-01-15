import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { useNavigate } from "@tanstack/solid-router"
import { useServerFn } from "@tanstack/solid-start"
import { createStore } from "solid-js/store"
import { useToastContext } from "~/hooks/useToastContext"
import { useUpload } from "~/hooks/useUpload"
import { createGameFn, getGameFn, updateGameFn } from "~/serverFn/games"
import { gameQueryOpts, gamesQueryOpts, gamesWithExtrasQueryOpts } from "../utils/gameQueryOpts"

export type Game = Awaited<ReturnType<typeof getGameFn>>

export enum MediaField {
    Cover = "cover",
    Banner = "banner",
    Screenshots = "screenshots"
}

export function useGameForm(props: { game?: Game }) {
    const { addToast } = useToastContext();
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [game, setGame] = createStore({
        gameId: props.game?.gameId,
        title: props.game?.title ?? "",
        cover: props.game?.cover ?? "",
        banner: props.game?.banner ?? "",
        developerId: props.game?.developerId ?? -1,
        publisherId: props.game?.publisherId ?? -1,
        summary: props.game?.summary ?? "",
        media: props.game?.media ?? [],
        platforms: props.game?.platforms ?? [],
        trailer: props.game?.trailer ?? "",
        releaseDate: props.game?.releaseDate ?? "",
        genres: props.game?.genres ?? [],
        actors: props.game?.actors ?? []
    })
    const paths = game.gameId ? ["games", game.gameId.toString()] : ["games"]
    const { setFiles, isUploading, upload } = useUpload(paths)

    const editGameMutation = useMutation(() => ({
        mutationFn: useServerFn(updateGameFn)
    }))

    const createGameMutation = useMutation(() => ({
        mutationFn: useServerFn(createGameFn)
    }))
    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        try {
            const uploadResult = await upload();
            const newCover = uploadResult.find(x => x.field == MediaField.Cover)?.key
            const newBanner = uploadResult.find(x => x.field == MediaField.Banner)?.key
            setGame({
                ...newCover && { cover: newCover },
                ...newBanner && { banner: newBanner },
                media: [
                    ...game.media,
                    ...uploadResult
                        .filter(x => x.field === MediaField.Screenshots)
                        .map(x => ({ key: x.key, contentType: x.file.type }))]
            })
            const { gameId, ...rest } = game
            if (gameId) {
                return editGameMutation.mutate({
                    data: {
                        ...rest,
                        gameId,
                        platforms: rest.platforms.map(platform => platform.platformId)
                    }
                }, {
                    onSuccess(data, variables, onMutateResult, context) {
                        addToast({ text: "Successfully edited game, ", type: "info" })
                        queryClient.invalidateQueries(gamesWithExtrasQueryOpts())
                        queryClient.invalidateQueries(gameQueryOpts(gameId))
                        queryClient.invalidateQueries(gamesQueryOpts())
                    },
                    onError(error, variables, onMutateResult, context) {
                        addToast({ text: error.message, type: "error" })
                    },
                })
            }
            return createGameMutation.mutate({
                data: {
                    ...rest,
                    platforms: rest.platforms.map(platform => platform.platformId)
                }
            }, {
                onSuccess(data, variables, onMutateResult, context) {
                    addToast({ text: "Successfully created game, " + data, type: "info" })
                    queryClient.invalidateQueries(gamesWithExtrasQueryOpts())
                    queryClient.invalidateQueries(gameQueryOpts(data))
                    queryClient.invalidateQueries(gamesQueryOpts())
                    navigate({ to: "/admin/games/$gameId/edit", params: { gameId: data } })
                },
                onError(error, variables, onMutateResult, context) {
                    addToast({ text: error.message, type: "error" })
                },
            })
        }
        catch (error) {

        }
    }
    return { game, setGame, isUploading, createGameMutation, editGameMutation, setFiles, handleSubmit }
}