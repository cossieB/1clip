import styles from "./ContentEditable.module.css"

type Props = {
    html: string;
    setter: (val: string) => void
    label: string
};

export function ContentEditable(props: Props) {
    return (
        <div 
            contenteditable
            class={[styles.contentEditable, {[styles.notEmpty]: props.html.length > 0}]}
            innerHTML={props.html}
            onBlur={e => props.setter(e.currentTarget.innerHTML)}
            style={{"--label": `"${props.label}"`}}
        />
    )
}