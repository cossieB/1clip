import { createMemo, Show } from "solid-js";
import { mediaSrc } from "~/utils/mediaSrc";
import styles from "./UserRank.module.css"

/* ───────── Rank model ───────── */

export const RANKS = [
    { name: "bronze", min: 0, max: 999 },
    { name: "silver", min: 1000, max: 1999 },
    { name: "gold", min: 2000, max: 4999 },
    { name: "platinum", min: 5000, max: 9999 },
    { name: "diamond", min: 10000, max: 19999 },
    { name: "master", min: 20000, max: Infinity },
] as const;

export type RankName = (typeof RANKS)[number]["name"];

const SUBRANKS = 4;
const ROMAN = ["I", "II", "III", "IV"]; // IV = lowest, I = highest

export interface RankInfo {
    rank: RankName;
    /** 1 (highest) – 4 (lowest). null for master. */
    subrank: 1 | 2 | 3 | 4 | null;
    /** e.g. "Gold II" or "Master" */
    label: string;
    /** xp at which the current (sub)rank starts */
    from: number;
    /** xp at which the next (sub)rank starts. null for master. */
    to: number | null;
    /** 0–1 progress through the current (sub)rank. 1 for master. */
    progress: number;
}

export function getRank(xp: number): RankInfo {
    const safe = Math.max(0, Math.floor(xp));
    const tier = RANKS.findLast((r) => safe >= r.min)!;

    if (tier.name === "master") {
        return { rank: "master", subrank: null, label: "Master", from: tier.min, to: null, progress: 1 };
    }

    const span = (tier.max + 1 - tier.min) / SUBRANKS;
    const step = Math.min(SUBRANKS - 1, Math.floor((safe - tier.min) / span)); // 0 = lowest
    const from = tier.min + step * span;
    const to = from + span;
    const subrank = (SUBRANKS - step) as 1 | 2 | 3 | 4;

    return {
        rank: tier.name,
        subrank,
        label: `${tier.name[0].toUpperCase()}${tier.name.slice(1)} ${ROMAN[subrank - 1]}`,
        from,
        to,
        progress: (safe - from) / span,
    };
}

/* ───────── Component ───────── */

export interface RankProps {
    xp: number;
    /** badge size in px */
    size?: number;
    /** show label + xp progress bar next to the badge */
    detail?: boolean;
}

export function UserRank(props: RankProps) {
    const info = createMemo(() => getRank(props.xp));
    const size = () => props.size ?? 48;

    return (
        <div
            class={styles.rank}
            data-rank={info().rank}
            style={{ "--size": `${size()}px` }}
            title={info().label}
        >
            <img
                class={styles["rank-badge"]}
                src={mediaSrc(`ranks/${info().rank}.png`)}
                alt={`${info().label} rank`}
                width={size()}
                height={size()}
                loading="lazy"
            />

            <Show when={info().subrank}>
                {(sub) => (
                    <span class={styles["rank-pips"]} role="img" aria-label={`Subrank ${ROMAN[sub() - 1]}`}>
                        {/* filled pips = how far up the tier you are (IV → 1 pip, I → 4 pips) */}
                        {Array.from({ length: SUBRANKS }, (_, i) => (
                            <i class={{ [styles.on]: i < SUBRANKS - sub() + 1 }} />
                        ))}
                    </span>
                )}
            </Show>

            <Show when={props.detail}>
                <div class={styles["rank-detail"]}>
                    <strong class={styles["rank-label"]}>{info().label}</strong>
                    <Show
                        when={info().to}
                        fallback={<span class={styles["rank-xp"]}>{props.xp.toLocaleString()} xp · max rank</span>}
                    >
                        {(to) => (
                            <>
                                <div
                                    class={styles["rank-bar"]}
                                    role="progressbar"
                                    aria-valuemin={info().from}
                                    aria-valuemax={to()}
                                    aria-valuenow={props.xp}
                                >
                                    <div class={styles["rank-fill"]} style={{ width: `${info().progress * 100}%` }} />
                                </div>
                                <span class={styles["rank-xp"]}>
                                    {props.xp.toLocaleString()} / {to().toLocaleString()} xp
                                </span>
                            </>
                        )}
                    </Show>
                </div>
            </Show>
        </div>
    );
}