import { Show } from "solid-js"
import styles from "./CompanyPage.module.css"

type Props = {
    id: number,
    name: string,
    logo: string | null,
    summary: string
    showName?: boolean
    type: "developer" | "publisher" | "platform" | "actor"
}

export function CompanyPage(props: Props) {
    
    return (
        <div>
            <div class={styles.header} >
                <Show when={props.showName}>
                    <h1>{props.name}</h1>
                </Show>
                <div class="cutout-wrapper">
                    <img 
                    style={{"view-transition-name": `${props.type}Id${props.id}` }}
                    class="cutout" 
                    classList={{ [styles.isActor]: props.showName }} 
                    src={props.logo ?? ""} 
                    alt="" 
                    />
                </div>
            </div>
            <div class={`${styles.main} cutout-wrapper`}>
                <div class={`cutout paras`} innerHTML={props.summary} />
            </div>
        </div>
    )
}