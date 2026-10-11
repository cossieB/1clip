import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { useNavigate } from "@tanstack/solid-router"
import { useServerFn } from "@tanstack/solid-start"
import { createStore } from "solid-js/store"
import { useToastContext } from "~/hooks/useToastContext"
import { useUpload } from "~/hooks/useUpload"
import * as gamesApi from "~/features/games/gamesApi"
import { gameQueryOpts, gamesQueryOpts, gamesWithExtrasQueryOpts } from "../utils/gameQueryOpts"
import { getGamesSignedUrls } from "~/integrations/storageService/serverFn"
import { Platform, RoleType } from "~/drizzle/models"

export type Game = Awaited<ReturnType<typeof gamesApi.getGameFn>>

export enum MediaField {
    Cover = "cover",
    Banner = "banner",
    Media = "media"
}

type Cast = {
    appearanceId?: number
    gameId: number
    gameTitle: string
    actorId: number
    name: string
    character: string
    roleType: RoleType
}

export function useGameForm(props: { game?: Game }) {
    const { addToast } = useToastContext();
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const abortController = new AbortController
    const [game, setGame] = createStore({
        gameId: props.game?.gameId,
        title: props.game?.title ?? "",
        cover: props.game?.cover ?? "",
        banner: props.game?.banner ?? "",
        developerId: props.game?.developerId ?? 0,
        developerName: props.game?.developer.name ?? "",
        publisherId: props.game?.publisherId ?? 0,
        publisherName: props.game?.publisher.name ?? "",
        summary: props.game?.summary ?? "",
        media: props.game?.media ?? [],
        platforms: props.game?.platforms ?? [] as Pick<Platform, 'platformId'>[],
        trailer: props.game?.trailer ?? "",
        releaseDate: props.game?.releaseDate ?? "",
        genres: props.game?.genres ?? [],
        actors: props.game?.actors ?? [] as Cast[]
    })

    const { setFiles, isUploading, files, convertAndUpload } = useUpload(abortController)

    const editGameMutation = useMutation(() => ({
        mutationFn: useServerFn(gamesApi.updateGameFn)
    }))
    const createGameMutation = useMutation(() => ({
        mutationFn: useServerFn(gamesApi.createGameFn)
    }))

    const uploadWrapper = async (id: number) => {
        const uploadResult = await convertAndUpload(getGamesSignedUrls, `games/${id}`)
        const newCover = uploadResult.find(x => x.field === MediaField.Cover)?.key
        const newBanner = uploadResult.find(x => x.field === MediaField.Banner)?.key
        const media = uploadResult
            .filter(x => x.field === MediaField.Media)
            .map(x => ({
                contentType: x.file.type,
                key: x.key,
                metadata: x.metadata
            }))
            .concat(game.media.filter(x => !x.key.startsWith("blob:")))
        return { newCover, newBanner, media }
    }
    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        try {
            const { gameId, ...rest } = game
            if (gameId) {
                const { media, newCover, newBanner } = await uploadWrapper(gameId)

                await editGameMutation.mutateAsync({
                    data: {
                        ...rest,
                        cover: newCover,
                        banner: newBanner,
                        gameId,
                        media,
                        platforms: rest.platforms.map(platform => platform.platformId),
                        characters: game.actors
                    }
                })
                queryClient.invalidateQueries(gamesWithExtrasQueryOpts())
                queryClient.invalidateQueries(gamesQueryOpts())
                queryClient.invalidateQueries(gameQueryOpts(gameId))
                addToast({ text: "Success", type: "info" })
                return
            }
            const newId = await createGameMutation.mutateAsync({
                data: {
                    ...rest,
                    cover: "q.png",
                    banner: "users/default_banner.jpg",
                    platforms: rest.platforms.map(platform => platform.platformId),
                    characters: game.actors
                }
            })

            const { media, newCover, newBanner } = await uploadWrapper(newId)

            await editGameMutation.mutateAsync({
                data: {
                    gameId: newId,
                    cover: newCover,
                    banner: newBanner,
                    media: media
                }
            })

            queryClient.invalidateQueries(gamesWithExtrasQueryOpts())
            queryClient.invalidateQueries(gamesQueryOpts())
            navigate({ to: "/admin/games/$gameId/edit", params: { gameId: newId } })
        }
        catch (error) {
            addToast({ text: String(error), type: "error" })
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