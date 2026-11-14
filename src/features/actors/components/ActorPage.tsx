import { AwaitedReturn } from "~/lib/utilityTypes";
import { getActorFn } from "../actorsApi";
import styles from "./ActorPage.module.css"
import { mediaSrc } from "~/utils/mediaSrc";
import { LazyRender } from "~/components/LazyRender";
import { GamesList } from "~/features/games/components/GamesList";

export function ActorPage(props: {actor: NonNullable<AwaitedReturn<typeof getActorFn>>}) {
    return (
        <div class={styles.container}>
            <div class={styles.logoContainer}>
            <img src={mediaSrc(props.actor.photo ?? "q.png")} alt="" />
            </div>
            <h1> {props.actor.name} </h1>
            <div class={["card", styles.overview]}  >
                <label >Overview</label>
                <div innerHTML={props.actor.bio} />
            </div>
            <LazyRender>
                <h2>Games</h2>
                <GamesList filters={{actorId: props.actor.actorId}} />
            </LazyRender>             
        </div>
    )
}