import styles from "./Forms.module.css"

type Props = {
    html: string;
    setter: (val: string) => void
};

export function ContentEditable(props: Props) {
    return (
        <div 
            contentEditable
            class={styles["content-editable"]}
            innerHTML={props.html}
            onBlur={e => props.setter(e.currentTarget.innerHTML)}
        />
    )
}