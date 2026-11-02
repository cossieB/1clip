import { createEffect, createUniqueId, Show, type ParentProps } from "solid-js";
import styles from "./Dialog.module.css"

type DialogProps = ParentProps<{
    open: boolean;
    onClose: () => void;
    title?: string;
}>;

export function Dialog(props: DialogProps) {
    let dialog!: HTMLDialogElement;
    const titleId = createUniqueId();

    // Sync the `open` prop to the native dialog state
    createEffect(
        () => props.open,
        (open) => {
            if (open && !dialog.open) dialog.showModal();
            if (!open && dialog.open) dialog.close();
        },
    );

    // Click on the backdrop (the dialog element itself) closes it
    const onClick = (e: MouseEvent) => {
        if (e.target === dialog) props.onClose();
    };

    return (
        <dialog
            ref={(el) => (dialog = el)}
            class={[styles.dialog, "cutout"]}
            aria-labelledby={props.title ? titleId : undefined}
            onClick={onClick}
            onClose={() => props.onClose()}
        >
            <div class={styles.dialogPanel}>
                <header class={styles.dialogHeader}>
                    <Show when={props.title}>
                        <h2 id={titleId}>{props.title}</h2>
                    </Show>
                    <button
                        class={["ghost", styles.dialogClose]}
                        aria-label="Close dialog"
                        onClick={() => props.onClose()}
                    >
                        ✕
                    </button>
                </header>
                <div class={styles.dialogBody}>{props.children}</div>
            </div>
        </dialog>
    );
}