import { For, Loading, Show, createEffect, createMemo, createSignal, createUniqueId, onSettled, refresh, type ParentProps } from "solid-js"
import { Portal } from "@solidjs/web"
import styles from "./SquadBlock.module.css"
import { PostContent } from "~/features/posts/components/PostContent"
import { SquadWithDetails } from "../squadsRepository"
import { mediaSrc } from "~/utils/mediaSrc"
import { getSquadApplicationsFn } from "../squadsApi"
import { ApplicationBlock } from "./ApplicationBlock"
import { getRelativeTime } from "~/lib/getRelativeTime"
import { AwaitedReturn } from "~/lib/utilityTypes"
import { session } from "~/features/auth/authApi"
import { HoldClickBtn } from "~/components/HoldClickBtn/HoldClickBtn"
import { TrashIcon } from "@lucide/solid"
import { useSquadDelete } from "../hooks/useSquadDelete"
import { useCloseSquad } from "../hooks/useCloseSquad"
import { useApplyToSquad } from "../hooks/useApplyToSquad"

type Props = ParentProps<{
    squad: SquadWithDetails
    onDelete: () => void
}>

export function SquadBlock(props: Props) {

    const [showApplications, setShowApplications] = createSignal(false)

    const signedIn = () => !!session().data
    const isOwner = () => signedIn() && session().data?.user.id === props.squad.creator.id
    const isExpired = () => props.squad.expiresAt ? new Date() > props.squad.expiresAt : false


    // ── Slots ──
    const filled = () => props.squad.acceptedApplicants.length
    const pips = () => Array.from({ length: props.squad.slots }, (_, i) => i < filled())

    const created = () => new Date(props.squad.createdAt)
    const wasEdited = () => !!props.squad.editedOn

    const { deleteAction, deleting } = useSquadDelete(props.squad.squadId, props.onDelete)
    const { applied, setMessage, apply, message } = useApplyToSquad(props.squad.squadId, () => props.squad.hasApplied)
    const { active, close } = useCloseSquad(props.squad.squadId, () => props.squad.isActive && !isExpired())

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
                        {filled() + 1} / {props.squad.slots + 1} filled
                    </span>
                </div>

                <div class={styles.pips} role="img" aria-label={`${filled()} of ${props.squad.slots} slots filled`}>
                    <span class={[styles.pip, { [styles.pipFilled]: true }]} />
                    <For each={pips()} keyed={false}>
                        {isFilled => <span class={[styles.pip, { [styles.pipFilled]: isFilled() }]} />}
                    </For>
                </div>
                <ul class={styles.applicants}>
                    <li>
                        <a
                            href={`/users/${props.squad.creator.username}`}
                            title={`@${props.squad.creator.username}`}
                            aria-label={`@${props.squad.creator.username}`}
                        >
                            <img
                                class={["cutout", styles.applicantAvatar]}
                                src={mediaSrc(props.squad.creator.image)}
                                alt=""
                                width="28"
                                height="28"
                            />
                        </a>
                    </li>
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
            </section>

            <Show when={props.squad.expiresAt}>
                {expires => (
                    <p class={styles.expires}>
                        {isExpired() ? "Expired" : "Expires"} <time datetime={new Date(expires()).toISOString()}>{getRelativeTime(expires())}</time>
                    </p>
                )}
            </Show>

            <footer class={styles.footer}>
                <Loading>
                    <Show
                        when={isOwner()}
                        fallback={
                            <div class={styles.apply}>
                                <textarea
                                    value={message()}
                                    onInput={e => setMessage(e.currentTarget.value)}
                                    maxlength={255}
                                    placeholder="Add a message to this squad's creator"
                                    disabled={!active() || !signedIn()}
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

                        <HoldClickBtn
                            disabled={deleting()}
                            action={async () => deleteAction()}
                            label={<TrashIcon color="var(--danger)" />}
                            variant="danger"
                        />

                        <Show when={active()}>
                            <HoldClickBtn
                                label="Close LFG"
                                action={close}
                                variant="danger"
                            />
                        </Show>
                    </Show>
                </Loading>
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
            cursor: cursor(),
        })
        const nextIds = new Set(next.map(x => x.applicationId))

        return [
            ...prev.filter(x => !nextIds.has(x.applicationId)),
            ...next]

    }, {

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
                            <For each={applications()} fallback={<p>No Applications Yet</p>}>
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