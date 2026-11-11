import { For, Show, action, createOptimistic, createSignal, useContext } from "solid-js"
import { SquadApplicationWithApplicant } from "../squadsRepository"
import { updateSquadApplicationFn } from "../squadsApi"
import { ToastContext } from "~/components/Toast/ToastProvider"
import { mediaSrc } from "~/utils/mediaSrc"
import { PostContent } from "~/features/posts/components/PostContent"
import { SquadApplicationStatus } from "~/drizzle/models"
import styles from "./ApplicationBlock.module.css"
import { getRelativeTime } from "~/lib/getRelativeTime"

type Props = {
    application: SquadApplicationWithApplicant
    /** Called after the server confirms a change, e.g. to refresh the LFG's accepted list. */
    onChange?: (status: SquadApplicationStatus) => void
}

const STATUSES: { value: SquadApplicationStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
]

const TONES: Record<SquadApplicationStatus, "warn" | "ok" | "danger"> = {
    pending: "warn",
    accepted: "ok",
    rejected: "danger",
}

export function ApplicationBlock(props: Props) {
    const {addToast} = useContext(ToastContext)
    // confirmed status, resets whenever the application prop is refetched
    const [confirmed, setConfirmed] = createSignal<SquadApplicationStatus>(() => props.application.status)
    // what the screen shows: optimistic inside the action, confirmed otherwise
    const [status, setStatus] = createOptimistic<SquadApplicationStatus>(() => confirmed())
    const [saving, setSaving] = createSignal(false)

    const update = action(function* (next: SquadApplicationStatus) {
        if (saving() || next === status()) return
        setSaving(true)
        try {
            setStatus(next);
            yield updateSquadApplicationFn({
                applicationId: props.application.applicationId,
                status: next,
            })
            setConfirmed(next)
            props.onChange?.(next)
        } catch (error) {
            addToast({
                text: error instanceof Error && error.message
                    ? error.message
                    : "Something went wrong. Please try again later.",
                type: "error",
            })
        } finally {
            setSaving(false)
        }
    })

    const applied = () => new Date(props.application.appliedAt)

    return (
        <article class={styles.application} data-status={status()} data-application-id={props.application.applicationId}>
            <header class={styles.header}>
                <a class={styles.applicant} href={`/users/${props.application.applicant.username}`}>
                    <img
                        class={["cutout", styles.avatar]}
                        src={mediaSrc(props.application.applicant.image)}
                        alt=""
                        width="40"
                        height="40"
                    />
                    <span class={styles.names}>
                        <span class={styles.username}>@{props.application.applicant.username}</span>
                        <span class={styles.meta}>
                            Applied <time datetime={applied().toISOString()}>{getRelativeTime(applied())}</time>
                        </span>
                    </span>
                </a>

                <span class={["badge", TONES[status()]]}>{status()}</span>
            </header>

            <Show when={props.application.message}>
                {message => <PostContent content={message()} collapsedLines={3} />}
            </Show>

            <div class={styles.segments} role="group" aria-label="Application status">
                <For each={STATUSES}>
                    {option => (
                        <button
                            type="button"
                            class={styles.segment}
                            // aria-pressed={status() === option.value}
                            disabled={saving()}
                            onClick={() => update(option.value)}
                        >
                            {option.label}
                        </button>
                    )}
                </For>
            </div>
        </article>
    )
}