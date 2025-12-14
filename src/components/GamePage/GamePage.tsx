import { type getGameFn } from "~/services/gamesService"
import styles from "./GamePage.module.css"
import { LogoLink } from "../LogoLink/LogoLink"
import { For, Show } from "solid-js"
import { YouTubeIframe } from "../YoutubeIframe"


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
                    <div class={styles.main} innerHTML={props.game.summary} />
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