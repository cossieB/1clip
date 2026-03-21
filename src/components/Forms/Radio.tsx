import { For } from "solid-js"
import titleCase from "~/lib/titleCase"
import styles from "./Radio.module.css"

type Props = {
    list: string[]
    value: string
    setValue: (val: string) => void
    name: string
}

export function RadioInput(props: Props) {
    return (
        <div class={styles.radios} >
            <For each={props.list}>
                {item =>
                    <div>
                        <label>
                            <input type="radio" 
                            checked={props.value == item} 
                            name={props.name} 
                            onchange={() => props.setValue(item)} />
                            {titleCase(item)}
                        </label>
                    </div>
                }
            </For>
        </div>
    )
}