import { createEffect, createSignal, Show, type JSXElement } from "solid-js";
import styles from "./Popover.module.css"
import { FormInput } from "../Forms/FormInput";
import { FormProvider } from "../Forms/FormContext";

type NewType = {
    children: JSXElement;
    ref?: HTMLDivElement | ((ref: HTMLDivElement) => void);
};

export function Popover(props: NewType) {
    return (
        <div ref={props.ref} class={styles.popover + " cutout"} popover id="autoPopover">
            {props.children}
        </div>
    )
}

type BaseProps = {
    text: string
    onConfirm: () => void
    type?: HTMLInputElement['type']
    label?: string
};

type ValueProps =
    | { challengeAnswer: string; setChallengeAnswer: (val: string) => void; }
    | { challengeAnswer?: never; setChallengeAnswer?: never; isPassword?: never; label?: never };

type Props = BaseProps & ValueProps;

export function ConfirmPopover(props: Props) {
    let [ref, setRef] = createSignal<HTMLDivElement>()

    createEffect(() => {
        ref()?.addEventListener("toggle", ev => {
            if (ev.newState == "closed")
                props.setChallengeAnswer?.("")
        })
    })

    return (
        <Popover
            ref={setRef}
        >
            <span style={{ "margin-bottom": "1rem" }}>{props.text}</span>
            <Show when={props.setChallengeAnswer}>
                <FormProvider>
                    <FormInput
                        field="challengeAnswer"
                        setter={props.setChallengeAnswer!}
                        value={props.challengeAnswer!}
                        label={props.label}
                        type={props.type}
                        autofocus
                    />
                </FormProvider>
            </Show>
            <button
                disabled={props.setChallengeAnswer && !props.challengeAnswer}
                onclick={() => {
                    props.onConfirm()
                    ref()?.hidePopover()
                }}
            >
                Confirm
            </button>
        </Popover>
    )
}