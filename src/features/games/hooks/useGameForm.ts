import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { createStore, unwrap } from "solid-js/store"
import { useToastContext } from "~/hooks/useToastContext"
import { useUpload } from "~/hooks/useUpload"
import { gameQueryOpts, gamesQueryOpts, gamesWithExtrasQueryOpts } from "../utils/gameQueryOpts"
import { createEffect } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { getGameFn, updateGameFn, createGameFn } from "~/services/gamesService"

export type Game = Awaited<ReturnType<typeof getGameFn>>

export enum MediaField {
    Cover = "cover",
    Banner = "banner",
    Media = "media"
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
    const { setFiles, isUploading, upload, files } = useUpload(paths)

    const editGameMutation = useMutation(() => ({
        mutationFn: updateGameFn
    }))

    const createGameMutation = useMutation(() => ({
        mutationFn: createGameFn
    }))

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();

        try {
            const uploadResult = await upload();
            const newCover = uploadResult.find(x => x.field == MediaField.Cover)?.key
            const newBanner = uploadResult.find(x => x.field == MediaField.Banner)?.key

            setGame({
                ...newCover && { cover: newCover },
                ...newBanner && { banner: newBanner },
                media: [
                    ...game.media.filter(m => !m.key.startsWith("blob")),
                    ...uploadResult
                        .filter(x => x.field === MediaField.Media)
                        .map(x => ({ key: x.key, contentType: x.file.type, metadata: x.metadata! }))]
            })
            const { gameId, ...rest } = game
            if (gameId) {
                return editGameMutation.mutate({
                    ...rest,
                    gameId,
                    platforms: rest.platforms.map(platform => platform.platformId)
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
                    ...rest,
                    platforms: rest.platforms.map(platform => platform.platformId)
            }, {
                onSuccess(data, variables, onMutateResult, context) {
                    addToast({ text: "Successfully created game, " + data, type: "info" })
                    queryClient.invalidateQueries(gamesWithExtrasQueryOpts())
                    queryClient.invalidateQueries(gameQueryOpts(data))
                    queryClient.invalidateQueries(gamesQueryOpts())
                    navigate(`/admin/games/${gameId}/edit`)
                },
                onError(error, variables, onMutateResult, context) {
                    addToast({ text: error.message, type: "error" })
                },
            })
        }
        catch (error) {

        }
    }
    return {
        game,
        setGame,
        isUploading,
        createGameMutation,
        editGameMutation,
        setFiles,
        handleSubmit,
        files
    }
}