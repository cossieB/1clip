// LFGBlock.tsx
import { For, Loading, Show, action, createEffect, createMemo, createOptimistic, createOptimisticStore, createSignal, createUniqueId, onSettled, refresh, useContext, type ParentProps } from "solid-js"
import { Portal } from "@solidjs/web"
import styles from "./SquadBlock.module.css"
import { PostContent } from "~/features/posts/components/PostContent"
import { SquadWithDetails } from "../squadsRepository"
import { ToastContext } from "~/components/Toast/ToastProvider"
import { mediaSrc } from "~/utils/mediaSrc"
import { applyToSquadFn, getSquadApplicationsFn, updateSquadFn } from "../squadsApi"
import { ApplicationBlock } from "./ApplicationBlock"
import { getRelativeTime } from "~/lib/getRelativeTime"
import { AwaitedReturn } from "~/lib/utilityTypes"

type Props = ParentProps<{
    squad: SquadWithDetails
    userId: string | null
}>

export function SquadBlock(props: Props) {
    const { addToast } = useContext(ToastContext)
    const toastError = (error: unknown) => addToast({
        text: error instanceof Error && error.message
            ? error.message
            : "Something went wrong. Please try again later.",
        type: "error",
    })

    const [showApplications, setShowApplications] = createSignal(false)
    const [confirmingClose, setConfirmingClose] = createSignal(false)
    const [message, setMessage] = createSignal("")

    const signedIn = () => props.userId !== null
    const isOwner = () => signedIn() && props.userId === props.squad.creator.id
    const isExpired = () => props.squad.expiresAt ? new Date() > props.squad.expiresAt : false

    // ── Apply (confirmed state resets when the prop is refetched) ──
    const [appliedConfirmed, setAppliedConfirmed] = createSignal(() => props.squad.hasApplied)
    const [applied, setApplied] = createOptimistic(() => appliedConfirmed())

    const apply = action(function* () {
        try {
            setApplied(true)
            yield applyToSquadFn({
                id: props.squad.squadId,
                message: message()
            })
        } catch (error) {
            toastError(error)
        }
    })

    // ── Close ──
    const [activeConfirmed, setActiveConfirmed] = createSignal(() => props.squad.isActive && !isExpired())
    const [active, setActive] = createOptimistic(() => activeConfirmed())

    const close = action(function* () {
        setConfirmingClose(false)
        try {
            setActive(false)
            yield updateSquadFn({
                lfgId: props.squad.squadId,
                isActive: false
            })
            setActiveConfirmed(false)
        } catch (error) {
            toastError(error)
        }
    })

    // ── Slots ──
    const filled = () => props.squad.acceptedApplicants.length
    const pips = () => Array.from({ length: props.squad.slots }, (_, i) => i < filled())

    const created = () => new Date(props.squad.createdAt)
    const wasEdited = () => !!props.squad.editedOn

    return (
        <article class={["card", styles.lfg]} data-squad-id={props.squad.squadId}>
            <header class={styles.header}>
                <a class={styles.author} href={`/users/${props.squad.creator.username}`}>
                    <img
                        class={["cutout", styles.avatar]}
                        src={mediaSrc(props.squad.creator.image)}
                        alt=""
                        width="40"
                        height="40"
                    />
                    <span class={styles.names}>
                        <span class={styles.username}>@{props.squad.creator.username}</span>
                        <span class={styles.meta}>
                            <time datetime={created().toISOString()}>{getRelativeTime(created())}</time>
                            <Show when={wasEdited()}>
                                <span> · edited</span>
                            </Show>
                        </span>
                    </span>
                </a>

                <span class={["badge", active() ? "ok" : "danger"]}>{active() ? "Open" : "Closed"}</span>
            </header>

            <h3 class={styles.title}>
                <Show when={props.squad.game} fallback="Looking for group">
                    {game => <a href={`/games/${game().id}`}>{game().title}</a>}
                </Show>
            </h3>

            <Show when={props.squad.text}>
                <PostContent content={props.squad.text} collapsedLines={4} />
            </Show>

            <section class={styles.party} aria-label="Party">
                <div class={styles.partyHeader}>
                    <span class={styles.partyLabel}>Party</span>
                    <span class={styles.count}>
                        {filled()} / {props.squad.slots} filled
                    </span>
                </div>

                <div class={styles.pips} role="img" aria-label={`${filled()} of ${props.squad.slots} slots filled`}>
                    <For each={pips()} keyed={false}>
                        {isFilled => <span class={[styles.pip, { [styles.pipFilled]: isFilled() }]} />}
                    </For>
                </div>

                <Show when={props.squad.acceptedApplicants.length}>
                    <ul class={styles.applicants}>
                        <For each={props.squad.acceptedApplicants}>
                            {person => (
                                <li>
                                    <a
                                        href={`/users/${person.username}`}
                                        title={`@${person.username}`}
                                        aria-label={`@${person.username}`}
                                    >
                                        <img
                                            class={["cutout", styles.applicantAvatar]}
                                            src={mediaSrc(person.image)}
                                            alt=""
                                            width="28"
                                            height="28"
                                        />
                                    </a>
                                </li>
                            )}
                        </For>
                    </ul>
                </Show>
            </section>

            <Show when={props.squad.expiresAt}>
                {expires => (
                    <p class={styles.expires}>
                        {isExpired() ? "Expired" : "Expires"} <time datetime={new Date(expires()).toISOString()}>{getRelativeTime(expires())}</time>
                    </p>
                )}
            </Show>

            <footer class={styles.footer}>
                <Show
                    when={isOwner()}
                    fallback={
                        <div class={styles.apply}>
                            <textarea
                                value={message()}
                                onInput={e => setMessage(e.currentTarget.value)}
                                maxlength={255}
                                placeholder="Add a message to this squad's creator"
                                disabled={!active()}
                            />
                            <button
                                type="button"
                                class="primary"
                                disabled={!signedIn() || !active() || applied()}
                                title={signedIn() ? undefined : "Sign in to apply"}
                                onClick={() => apply()}
                            >
                                {!active() ? "Closed" : applied() ? "Applied ✓" : "Apply"}
                            </button>
                        </div>
                    }
                >
                    <button type="button" class="primary" onClick={() => setShowApplications(true)}>
                        Show applications
                    </button>

                    <Show when={active()}>
                        <Show
                            when={confirmingClose()}
                            fallback={
                                <button type="button" class={["secondary", styles.danger]} onClick={() => setConfirmingClose(true)}>
                                    Close LFG
                                </button>
                            }
                        >
                            <button type="button" class={["secondary", styles.danger]} onClick={() => close()}>
                                Confirm close
                            </button>
                            <button type="button" class="ghost" onClick={() => setConfirmingClose(false)}>
                                Cancel
                            </button>
                        </Show>
                    </Show>
                </Show>
            </footer>

            <Show when={showApplications()}>
                <ApplicationsDialog
                    onClose={() => setShowApplications(false)}
                    id={props.squad.squadId}
                />
            </Show>
        </article>
    )
}

function ApplicationsDialog(props: ParentProps<{ onClose: () => void, id: number }>) {
    const titleId = createUniqueId()
    let dialog!: HTMLDialogElement
    let lastItem: HTMLElement | undefined
    let observer!: IntersectionObserver
    let done = false
    const [cursor, setCursor] = createSignal<number>()

    // showModal() needs the element to be in the document, and Portal may attach it just after mount
    onSettled(() => {
        observer = new IntersectionObserver((entries) => {
            const last = entries.at(-1);
            if (last?.isIntersecting && !done) {
                const commentId = Number((last.target as HTMLElement).dataset.commentId);
                const item = applications().find(comment => comment.applicationId === commentId);
                if (item) setCursor(commentId)
            }
        })
        const open = () => {
            if (!dialog.open) dialog.showModal()
        }
        if (dialog.isConnected) open()
        else queueMicrotask(open)
    })


    const applications = createMemo(async (prev: AwaitedReturn<typeof getSquadApplicationsFn> = []) => {
        const next = await getSquadApplicationsFn({
            squadId: props.id,
            cursor: cursor()
        })
        return [...prev, ...next]
    }, {
        id: "applicationId"
    })
    createEffect(
        () => applications.length,
        () => {
            setTimeout(() => {
                const cards = document.querySelectorAll<HTMLElement>(`[data-application-id]`);
                if (cards.length === 0) return;
                lastItem && observer?.unobserve(lastItem);
                lastItem = cards[cards.length - 1];
                observer?.observe(lastItem);
            }, 50)
        }
    )

    return (
        <Portal>
            <dialog
                ref={dialog}
                class={styles.dialog}
                aria-labelledby={titleId}
                onClose={() => props.onClose()}
                onClick={e => {
                    // a click on the backdrop targets the dialog itself
                    if (e.target === dialog) dialog.close()
                }}
            >
                <div class={styles.dialogInner}>
                    <header class={styles.dialogHeader}>
                        <h3 id={titleId} class={styles.dialogTitle}>
                            Applications
                        </h3>
                        <button type="button" class="ghost" aria-label="Close" onClick={() => dialog.close()}>
                            ✕
                        </button>
                    </header>
                    <div class={styles.dialogBody}>
                        <Loading>
                            <For each={applications()}>
                                {application =>
                                    <ApplicationBlock
                                        application={application}
                                        onChange={() => refresh(applications)}
                                    />}
                            </For>
                        </Loading>
                    </div>
                </div>
            </dialog>
        </Portal>
    )
}