import { createEffect } from "solid-js";
import styles from "./Forms.module.css"

type Props = {
    html: string;
    setter: (val: string) => void
    label: string
};

export function ContentEditable(props: Props) {
    return (
        <div 
            contentEditable
            class={styles["content-editable"]}
            classList={{[styles.notEmpty]: props.html.length > 0}}
            innerHTML={props.html}
            onBlur={e => props.setter(e.currentTarget.innerHTML)}
            style={{"--label": `"${props.label}"`}}
        />
    )
}