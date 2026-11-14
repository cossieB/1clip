import { AwaitedReturn } from "~/lib/utilityTypes";
import { getPlatformFn } from "../platformsApi";
import { LazyRender } from "~/components/LazyRender";
import styles from "./PlatformPage.module.css"
import { mediaSrc } from "~/utils/mediaSrc";
import { GamesList } from "~/features/games/components/GamesList";

export function PlatformPage(props: {company: NonNullable<AwaitedReturn<typeof getPlatformFn>>}) {
    return (
        <div class={styles.container}>
            <div class={styles.logoContainer}>
            <img src={mediaSrc(props.company.logo)} alt="" />
            </div>
            <h1> {props.company.name} </h1>
            <div class={["card", styles.overview]}  >
                <label >Overview</label>
                <div innerHTML={props.company.summary} />
            </div>
            <LazyRender>
                <h2>Games</h2>
                <GamesList filters={{platformId: props.company.platformId}} />
            </LazyRender>      
     
        </div>
    )
}