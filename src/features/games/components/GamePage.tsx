import { AwaitedReturn } from "~/lib/utilityTypes";
import { getGameFn } from "../gamesApi";
import styles from "./GamePage.module.css"
import { mediaSrc } from "~/utils/mediaSrc";
import { For, Loading, Show } from "solid-js";
import { session } from "~/features/auth/authApi";
import { IframeFactory } from "~/features/posts/components/IframeFactory";
import { formatIsoDate } from "~/lib/formatDate";
import { Carousel } from "~/components/Carousel/Carousel";
import { PhotoCardGrid } from "~/components/CardLink/PhotoCardLink";
import { paths } from "~/router";

export function GamePage(props: { game: NonNullable<AwaitedReturn<typeof getGameFn>> }) {
    return (
        <div class={styles.container}>
            <div class={styles.hero} >
                <img class={styles.banner} src={mediaSrc(props.game.banner)} alt="" />
            </div>
            <header class={styles.header}>
                <img src={mediaSrc(props.game.cover)} alt="" />
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
                            <button>Edit</button>
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
                        <span> {props.game.developer.name} </span>
                    </div>
                    <div>
                        <label> Publisher </label>
                        <span> {props.game.publisher.name} </span>
                    </div>
                </div>
                <div class={styles.row}>
                    <label>Tags</label>
                    <div class={styles.list}>
                        <For each={props.game.genres}>
                            {genre => <span class={styles.item} > {genre} </span>}
                        </For>
                    </div>
                </div>
                <div class={styles.row}>
                    <label >Platforms</label>
                    <div class={styles.list}>
                        <For each={props.game.platforms}>
                            {platform => <span class={styles.item} > {platform.name} </span>}
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
            <Show when={props.game.media.length > 0}>
                <div style={{ "margin-block": "1rem" }}>
                    <Carousel
                        media={props.game.media.filter(m => !m.contentType.startsWith("audio")).map(m => ({
                            ...m,
                            url: mediaSrc(m.key)
                        }))}
                        showNextBtn
                        showPrevBtn
                    />
                </div>
            </Show>
            <Show when={props.game.actors.length > 0}>
                <h3 >Cast</h3>
            </Show>
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

        </div>
    )
}
