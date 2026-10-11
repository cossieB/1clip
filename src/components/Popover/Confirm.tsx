import { ComponentProps, Show, splitProps } from "solid-js"
import styles from "./Confirm.module.css"
import { StandaloneInput } from "../Forms/FormInput"
import clickOutside from "~/lib/clickOutside";
false && clickOutside;

type BaseProps = {
    headline: string
    additionalText?: string
    onConfirm: () => void
    type?: HTMLInputElement['type']
    label?: string
};

type ValueProps =
    | { challengeAnswer: string; setChallengeAnswer: (val: string) => void; }
    | { challengeAnswer?: never; setChallengeAnswer?: never; };

type Props = ComponentProps<"dialog"> & {
    
} & BaseProps & ValueProps

export function ConfirmDialog(props: Props) {
    let dialogElem!: HTMLDialogElement
    let inputRef!: HTMLInputElement
    const [local, attributes] = splitProps(props, ["headline", "onConfirm", "type", "label", "challengeAnswer", "setChallengeAnswer", "additionalText"])
    
    return (
        <dialog
            {...attributes}
            closedby={props.closedby ?? "any"}
            ref={dialogElem}
            class={styles.dialog}
            use:clickOutside={() => dialogElem?.close()}
            onClose={() => inputRef.value = ""}
        >
            <span class={styles.headline} >{props.headline}</span>
            <Show when={props.additionalText}>
                <p> {props.additionalText} </p>
            </Show>
            <Show when={props.setChallengeAnswer}>
                <StandaloneInput
                    label={props.label ?? ""}
                    onInput={e => props.setChallengeAnswer!(e.currentTarget.value)}
                    type={props.type}
                    autofocus
                    ref={inputRef}
                />
            </Show>
            <div class={styles.btns}>
                <button 
                    autofocus
                    onclick={() => dialogElem.close()}
                >
                    Cancel
                </button>
            <button
                disabled={props.setChallengeAnswer && !props.challengeAnswer}
                onclick={() => {
                    props.onConfirm()
                    dialogElem.close()
                }}
            >
                Confirm
            </button>

            </div>
        </dialog>
    )
}