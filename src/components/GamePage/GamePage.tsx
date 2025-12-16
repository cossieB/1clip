import { type getGameFn } from "~/services/gamesService"
import styles from "./GamePage.module.css"
import { LogoLink } from "../LogoLink/LogoLink"
import { For, Show } from "solid-js"
import { YouTubeIframe } from "../YoutubeIframe"
import { Link } from "@tanstack/solid-router"
import { PhotoCardGrid } from "../CardLink/PhotoCardLink"
import { Carousel } from "../Carousel"


type Props = {
    game: Awaited<ReturnType<typeof getGameFn>>
}

export function GamePage(props: Props) {

    return (
        <div class={styles.game}>
            <div class={styles.header}>
                <h1 class={styles.title}>{props.game.title}</h1>
                <div class={styles.hero}>
                    <img src={props.game.banner} alt="" />
                </div>
                <img class={styles.cover} src={props.game.cover} alt="" />
            </div>
            <div class={styles.body}>
                <div class={styles.columns}>
                    <div class={`${styles.main} paras`} innerHTML={props.game.summary} />
                    <LogoLink
                        href="developer"
                        item={{
                            id: props.game.developer.developerId,
                            logo: props.game.developer.logo ?? "",
                            name: props.game.developer.name
                        }}
                        className={styles.company}
                    />
                    <LogoLink
                        href="publisher"
                        item={{
                            id: props.game.publisher.publisherId,
                            logo: props.game.publisher.logo ?? "",
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
                                        logo: platform.logo ?? "",
                                        name: platform.name
                                    }}
                                />
                            }
                        </For>
                    </div>
                    <div class={styles.tags}>
                        <For each={props.game.tags}>
                            {tag =>
                                <div>
                                    {tag}
                                    <Link to="/games/tags/$tag" params={{ tag }} />
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
                        getPic={actor => actor.photo ?? ""}
                        getSublabel={actor => actor.character}
                        to="/actors/$actorId"
                        getParam={actor => ({ actorId: actor.actorId })}
                    />
                </Show>
                <Show when={props.game.images.length > 1}>
                    <h2>Screenshots</h2>
                <Carousel images={props.game.images} showNextBtn showPrevBtn />
                </Show>
            </div>
        </div>
    )
}

function ReleaseDate(props: { date: Date }) {

    return (
        <div class={styles.date}>
            <span> {props.date.getDate()} </span>
            <span> {props.date.toLocaleString("default", { month: "long" })} </span>
            <span> {props.date.getFullYear()} </span>
        </div>
    )
}