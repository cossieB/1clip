import { AwaitedReturn } from "~/lib/utilityTypes";
import { getPlatformFn } from "../platformsApi";
import { LazyRender } from "~/components/LazyRender";
import styles from "./PlatformPage.module.css"
import { mediaSrc } from "~/utils/mediaSrc";
import { GamesList } from "~/features/games/components/GamesList";
import { EditInfoBtn } from "~/components/EditInfoBtn";
import { paths } from "~/router";

export function PlatformPage(props: { platform: NonNullable<AwaitedReturn<typeof getPlatformFn>> }) {
    return (
        <div class={styles.container}>
            <div class={styles.logoContainer}>
                <img src={mediaSrc(props.platform.logo)} alt="" />
            </div>
            <h1> {props.platform.name} </h1>
            <EditInfoBtn href={paths.admin.platforms(props.platform.platformId)} />
            <div class={["card", styles.overview]}  >
                <label >Overview</label>
                <div innerHTML={props.platform.summary} />
            </div>
            <LazyRender>
                <h2>Games</h2>
                <GamesList filters={{ platformId: props.platform.platformId }} />
            </LazyRender>

        </div>
    )
}