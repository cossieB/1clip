import { ComponentProps, createEffect, createSignal, Show, type JSXElement } from "solid-js";
import styles from "./Popover.module.css"
import { StandaloneInput } from "../Forms/FormInput";

type NewType = {
    children: JSXElement;
    id: string
    ref?: HTMLDivElement | ((ref: HTMLDivElement) => void);
};

export function Popover(props: NewType) {
    return (
        <div ref={props.ref} class={styles.popover + " cutout"} popover id={props.id ?? "autoPopover"}>
            {props.children}
        </div>
    )
}

type BaseProps = {
    text: string
    onConfirm: () => void
    type?: HTMLInputElement['type']
    label?: string
    id: string
};

type ValueProps =
    | { challengeAnswer: string; setChallengeAnswer: (val: string) => void; }
    | { challengeAnswer?: never; setChallengeAnswer?: never; isPassword?: never; label?: never; };

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
            id={props.id}
        >
            <span style={{ "margin-bottom": "1rem" }}>{props.text}</span>
            <Show when={props.setChallengeAnswer}>
                <StandaloneInput
                    field="challengeAnswer"
                    setter={props.setChallengeAnswer!}
                    value={props.challengeAnswer!}
                    label={props.label}
                    type={props.type}
                    autofocus
                />
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

export function ConfirmPopoverWithButton(props: {popover: Props} & {button?: ComponentProps<'button'>}) {
    return (
        <>
            <button {...props.button} popoverTarget={props.popover.id} />
            <ConfirmPopover
                {...props.popover}
                id={props.popover.id}                
            />
        </>
    )
}