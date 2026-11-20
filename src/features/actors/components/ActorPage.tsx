import { AwaitedReturn } from "~/lib/utilityTypes";
import { getActorFn } from "../actorsApi";
import styles from "./ActorPage.module.css"
import { mediaSrc } from "~/utils/mediaSrc";
import { LazyRender } from "~/components/LazyRender";
import { GamesList } from "~/features/games/components/GamesList";
import { EditInfoBtn } from "~/components/EditInfoBtn";
import { paths } from "~/router";

export function ActorPage(props: { actor: NonNullable<AwaitedReturn<typeof getActorFn>> }) {
    return (
        <div class={styles.container}>
            <div class={styles.logoContainer}>
                <img src={mediaSrc(props.actor.photo ?? "q.png")} alt={props.actor.name} />
            </div>
            <h1> {props.actor.name} </h1>
            <EditInfoBtn href={paths.admin.actors(props.actor.actorId)} />
            <div class={["card", styles.overview]}  >
                <label >Overview</label>
                <div innerHTML={props.actor.bio} />
            </div>
            <LazyRender>
                <h2>Games</h2>
                <GamesList filters={{ actorId: props.actor.actorId }} />
            </LazyRender>
        </div>
    )
}