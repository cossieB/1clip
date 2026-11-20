import { AwaitedReturn } from "~/lib/utilityTypes";
import { getGameFn, getSimilarGamesFn } from "../gamesApi";
import styles from "./GamePage.module.css"
import { mediaSrc } from "~/utils/mediaSrc";
import { createMemo, createSignal, For, Loading, Show } from "solid-js";
import { session } from "~/features/auth/authApi";
import { IframeFactory } from "~/features/posts/components/IframeFactory";
import { formatIsoDate } from "~/lib/formatDate";
import { Carousel } from "~/components/Carousel/Carousel";
import { PhotoCardGrid } from "~/components/CardLink/PhotoCardLink";
import { paths } from "~/router";
import { AudioPlayer } from "~/components/AudioPlayer/AudioPlayer";
import { LazyRender } from "~/components/LazyRender";

export function GamePage(props: { game: NonNullable<AwaitedReturn<typeof getGameFn>> }) {
    const screenshots = createMemo(() => props.game.media.filter(m => !m.contentType.startsWith("audio")).map(m => ({
        ...m,
        url: mediaSrc(m.key)
    })))

    const audio = () => props.game.media.filter(m => m.contentType.startsWith("audio")).at(0)

    return (
        <div class={styles.container}>
            <div class={styles.hero} >
                <img class={styles.banner} src={mediaSrc(props.game.banner)} alt="" />
            </div>
            <header class={styles.header}>
                <img style={{ "view-transition-name": "gameId" + props.game.gameId }} src={mediaSrc(props.game.cover)} alt="" />
                <h1> {props.game.title} </h1>

                <div class={styles.actions}>
                    <button
                        class="ghost"
                        onClick={() => navigator.share({
                            title: `${props.game.title} :: 1Clip`,
                            url: location.href
                        })}
                    >
                        Share
                    </button>
                    <Loading>
                        <Show when={session().data?.user.role == "admin"}>
                            <a href={paths.admin.games(props.game.gameId)} class="button ghost">Edit</a>
                        </Show>
                    </Loading>
                </div>
            </header>
            <div class={["card", styles.basic]}>
                <div class={[styles.row, styles.flex]}>
                    <div>
                        <label> Release Date </label>
                        <span> {formatIsoDate(props.game.releaseDate)} </span>
                    </div>
                    <div>
                        <label> Developer </label>
                        <a href={paths.companies(props.game.developerId)}> {props.game.developer.name} </a>
                    </div>
                    <div>
                        <label> Publisher </label>
                        <a href={paths.companies(props.game.publisherId)}> {props.game.publisher.name} </a>
                    </div>
                </div>
                <div class={styles.row}>
                    <label>Tags</label>
                    <div class={styles.list}>
                        <For each={props.game.genres}>
                            {genre => <a href={paths.games({ genre })} class={styles.item} > {genre} </a>}
                        </For>
                    </div>
                </div>
                <div class={styles.row}>
                    <label >Platforms</label>
                    <div class={styles.list}>
                        <For each={props.game.platforms}>
                            {platform => <a href={paths.platforms(platform.platformId)} class={styles.item} > {platform.name} </a>}
                        </For>
                    </div>
                </div>
            </div>
            <Show when={props.game.trailer}>
                <div class={styles.iframe}>
                    <IframeFactory link={props.game.trailer!} />
                </div>
            </Show>
            <div class={["card", styles.overview]}  >
                <label >Overview</label>
                <div innerHTML={props.game.summary} />
            </div>
            <Show when={screenshots().length > 0}>
                <div>
                    <Carousel
                        media={screenshots()}
                        showNextBtn
                        showPrevBtn
                    />
                </div>
            </Show>
            <Show when={props.game.actors.length > 0}>
                <h3 >Cast</h3>
            </Show>
            <section class={styles.cast}>

                <PhotoCardGrid
                    arr={props.game.actors}
                    getLabel={actor => actor.name}
                    getPic={actor => actor.photo ?? "q.png"}
                    getHref={actor => paths.actors(actor.actorId)()}
                    getAttr={actor => ({
                        [`data-actor-id`]: actor.actorId.toString()
                    })}
                    getSublabel={actor => actor.character}
                />
            </section>
            <div class={styles.audio}>

                <Show when={audio()}>
                    {audio => <AudioPlayer audio={audio()} />}
                </Show>
            </div>
            <LazyRender>
                <SimilarGames gameId={props.game.gameId} />
            </LazyRender>
        </div>
    )
}


function SimilarGames(props: { gameId: number }) {
    const games = createMemo(() => getSimilarGamesFn(props.gameId), { lazy: true })

    return (
        <>
        <h3>Similar Games</h3>
        <PhotoCardGrid
            arr={games()}
            getPic={game => game.cover}
            getHref={game => `/games/${game.gameId}`}
            getLabel={game => game.title}
            getAttr={game => ({
                [`data-game-id`]: game.gameId.toString()
            })}
            />
            </>
    )
}