import styles from "./Spinner.module.css";

type SpinnerProps = {
    size?: "small" | "medium" | "large";
    label?: string;
};

export function Spinner(props: SpinnerProps) {
    return (
        <span
            role="status"
            aria-label={props.label ?? "Loading"}
            class={[styles.spinner, {
                [styles.small]: props.size === "small",
                [styles.large]: props.size === "large",
            }]}
        />
    );
}