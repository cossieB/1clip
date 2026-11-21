// DailyChallenges.tsx
import { createMemo, For, Loading, Errored, SourceAccessor, Show } from "solid-js";
import styles from "./DailyChallenges.module.css";
import { getTodaysChallengeProgressFn } from "../challengeApi";
import { AwaitedReturn } from "~/lib/utilityTypes";
import { session } from "~/features/auth/authApi";

export function DailyChallenges() {
    const challenges = createMemo(() => session().data ? getTodaysChallengeProgressFn() : []);
    return (
        <section class={`card ${styles.root}`}>
            <h2>Daily challenges</h2>
            <Errored
                fallback={(_err, reset) => (
                    <div class={styles.error}>
                        <p>Couldn't load today's challenges.</p>
                        <button class="secondary" onClick={reset}>Retry</button>
                    </div>
                )}
            >
                <Loading fallback={<Skeleton />}>
                    <ChallengeList challenges={challenges} />
                </Loading>
            </Errored>
        </section>
    );
}

// Async reads live in a child so they sit inside the Loading boundary
function ChallengeList(props: {challenges: SourceAccessor<AwaitedReturn<typeof getTodaysChallengeProgressFn>>}) {

    const doneCount = () => props.challenges().filter(c => c.completed).length;
    const earnedXp = () =>
        props.challenges().reduce((sum, c) => sum + (c.completed ? c.xpReward : 0), 0);
    const totalXp = () => props.challenges().reduce((sum, c) => sum + c.xpReward, 0);
    const pct = () =>
        props.challenges().length ? (doneCount() / props.challenges().length) * 100 : 0;

    return (
        <>
            <div class={styles.summary}>
                <span class={styles.count}>
                    {doneCount()}<small>/{props.challenges().length}</small>
                </span>
                <span class={styles.xp}>{earnedXp()} / {totalXp()} XP today</span>
            </div>

            <div
                class={styles.bar}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={props.challenges().length}
                aria-valuenow={doneCount()}
                style={{ "--pct": `${pct()}%` }}
            />

            <ul class={styles.list}>
                <For each={props.challenges()}>
                    {(c) => (
                        <li class={styles.item} data-done={String(c.completed)}>
                            <span class={styles.check} aria-hidden="true" />
                            <div class={styles.text}>
                                <strong>{c.title}</strong>
                                <span>{c.description}</span>
                            </div>
                            <span class={["badge", `${c.completed ? "ok" : "info"}`]}>
                                +{c.xpReward} XP
                            </span>
                        </li>
                    )}
                </For>
            </ul>
        </>
    );
}

function Skeleton() {
    return (
        <div class={styles.skeleton} aria-busy="true">
            <div /><div /><div /><div />
        </div>
    );
}