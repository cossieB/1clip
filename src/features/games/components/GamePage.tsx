import { getSimilarGames, type getGameFn } from "~/serverFn/games"
import styles from "./GamePage.module.css"
import { createEffect, createSignal, For, Show, Suspense } from "solid-js"
import { ClientOnly, Link } from "@tanstack/solid-router"
import { LogoLink } from "~/components/LogoLink/LogoLink"
import { PhotoCardGrid } from "~/components/CardLink/PhotoCardLink"
import { STORAGE_DOMAIN } from "~/utils/env"
import { HeroHeader } from "~/components/Hero/HeroHeader"
import { Screenshots } from "./Screenshots"
import { GameAudio } from "./GameAudio"
import { IframeFactory } from "~/components/embeds/IframeFactory"
import { useQuery } from "@tanstack/solid-query"
import { useServerFn } from "@tanstack/solid-start"
import { useInView } from "~/hooks/useInView"

type Props = {
    game: Awaited<ReturnType<typeof getGameFn>>
}

export function GamePage(props: Props) {

    return (
        <div class={styles.game}>
            <HeroHeader
                banner={STORAGE_DOMAIN + props.game.banner}
                image={STORAGE_DOMAIN + props.game.cover}
                label={props.game.title}
                viewTransitionName={"gameId" + props.game.gameId}
            />
            <div class={styles.body}>
                <div class={styles.columns}>
                    <div class={`${styles.main} cutout-wrapper`}>
                        <div class={`paras cutout`} innerHTML={props.game.summary} />
                    </div>
                    <LogoLink
                        href="developer"
                        item={{
                            id: props.game.developer.developerId,
                            logo: STORAGE_DOMAIN + props.game.developer.logo,
                            name: props.game.developer.name
                        }}
                        className={styles.company}
                    />
                    <LogoLink
                        href="publisher"
                        item={{
                            id: props.game.publisher.publisherId,
                            logo: STORAGE_DOMAIN + props.game.publisher.logo,
                            name: props.game.publisher.name
                        }}
                        className={styles.company}
                    />
                    <ReleaseDate date={props.game.releaseDate} />
                    <div class={styles.platforms}>
                        <For each={props.game.platforms}>
                            {platform =>
                                <LogoLink
                                    href="platform"
                                    item={{
                                        id: platform.platformId,
                                        logo: STORAGE_DOMAIN + platform.logo,
                                        name: platform.name
                                    }}
                                />
                            }
                        </For>
                    </div>
                    <div class={styles.tags}>
                        <For each={props.game.genres}>
                            {genre =>
                                <div class="cutout">
                                    {genre}
                                    <Link to="/games/genres/$genre" params={{ genre }} />
                                </div>
                            }
                        </For>
                    </div>
                </div>
                <Show when={!!props.game.trailer}>
                    <div class={styles.iframe}>
                        <IframeFactory link={props.game.trailer!} />
                    </div>
                </Show>
                <Show when={props.game.actors.length > 0}>
                    <h2>Cast</h2>
                    <PhotoCardGrid
                        arr={props.game.actors}
                        getLabel={actor => actor.name}
                        getPic={actor => STORAGE_DOMAIN + actor.photo}
                        getSublabel={actor => actor.character}
                        to="/actors/$actorId"
                        getParam={actor => ({ actorId: actor.actorId })}
                    />
                </Show>
                <Screenshots media={props.game.media} />
            </div>
            <h2>Similar Games</h2>
            <ClientOnly>
                <SimilarGames gameId={props.game.gameId} />
            </ClientOnly>
            <GameAudio media={props.game.media} />
        </div>
    )
}

function SimilarGames(props: { gameId: number }) {
    const [ref, setRef] = createSignal<HTMLDivElement>()
    const isInView = useInView(ref)
    const queryFn = useServerFn(getSimilarGames)
    const result = useQuery(() => ({
        enabled: isInView(),
        queryKey: ["games", "similarTo", props.gameId],
        queryFn: () => queryFn({ data: props.gameId })
    }))

    return (
        <div ref={setRef}>

            <PhotoCardGrid
                arr={result.data ?? []}
                getLabel={game => game.title}
                getPic={game => STORAGE_DOMAIN + game.cover}
                getParam={game => ({ gameId: game.gameId })}
                to="/games/$gameId"

            />
        </div>
    )
}

function ReleaseDate(props: { date: string }) {
    const date = props.date.split(/[\-\/]/)
    return (
        <div class={`${styles.date} cutout`}>
            <span> {date[2]} </span>
            <span> {new Date(2000, parseInt(date[1]) - 1, 1).toLocaleString('default', { month: 'long' })} </span>
            <span> {date[0]} </span>
        </div>
    )
}
