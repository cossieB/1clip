import { type getGameFn } from "~/serverFn/games"
import styles from "./GamePage.module.css"
import { For, Show } from "solid-js"
import { Link } from "@tanstack/solid-router"
import { LogoLink } from "~/components/LogoLink/LogoLink"
import { PhotoCardGrid } from "~/components/CardLink/PhotoCardLink"
import { Carousel } from "~/components/Carousel/Carousel"
import { YouTubeIframe } from "~/components/YoutubeIframe"
import { STORAGE_DOMAIN } from "~/utils/env"
import { HeroHeader } from "~/components/Hero/HeroHeader"

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
                        <YouTubeIframe link={props.game.trailer!} />
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
                <Show when={props.game.media.length > 0}>
                    <h2>Screenshots</h2>
                    <Carousel
                        media={props.game.media.map(m => ({
                            contentType: m.contentType,
                            url: STORAGE_DOMAIN + m.key
                        }))}
                        showNextBtn
                        showPrevBtn
                    />
                </Show>
            </div>
        </div>
    )
}

function ReleaseDate(props: { date: string }) {
    const date = props.date.split(/[\-\/]/)
    return (
        <div class={`${styles.date} cutout`}>
            <span> {date[2]} </span>
            <span> {new Date(2000, parseInt(date[1]) - 1, 1).toLocaleString('default', {month: 'long'})} </span>
            <span> {date[0]} </span>
        </div>
    )
}
