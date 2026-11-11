import { createSignal, createStore, For, onSettled, Show } from "solid-js";
import styles from "./CreateSquadPage.module.css";
import { SearchAutocomplete } from "~/components/SearchAutocomplete/SearchAutocomplete";
import { getGamesFn } from "~/features/games/gamesApi";
import { FALLBACK_TIME_ZONE, detectTimeZone, listTimeZones, MAX_TEXT, MAX_SLOTS, zonedLocalToUtc } from "../utils/timeZone";
import { createSquadFn } from "../squadsApi";
import { useNavigate } from "@solidjs/router";
import { paths } from "~/router";

type Game = Awaited<ReturnType<typeof getGamesFn>>[number];

export type LfgInput = {
    text: string;
    gameId: number | null;
    /** open slots, excluding the owner */
    slots: number;
    expiresAt: Date | null;
};

type FieldErrors = Partial<Record<"text" | "slots" | "expiresAt", string>>;

export default function CreateSquadPage() {
    const [game, setGame] = createSignal<Game | null>(null);
    const [text, setText] = createSignal("");
    const [slots, setSlots] = createSignal(1);
    const [expiry, setExpiry] = createStore({
        datetime: "",
        timeZone: ""
    });

    const [timeZones, setTimeZones] = createSignal([FALLBACK_TIME_ZONE]);
    const epochExpiry = () => expiry.datetime ? Temporal.ZonedDateTime.from(`${expiry.datetime}[${expiry.timeZone}]`).epochMilliseconds : null
    const isInvalidExpiry = () => (epochExpiry() ?? Number.MAX_SAFE_INTEGER) - Date.now() < 30 * 60 * 1000
    onSettled(() => {
        const detected = detectTimeZone();
        setTimeZones(listTimeZones(detected));
        setExpiry(s => {
            s.timeZone = detected
        })
    });
    const navigate = useNavigate()
    const [errors, setErrors] = createSignal<FieldErrors>({});
    const [formError, setFormError] = createSignal("");
    const [pending, setPending] = createSignal(false);

    function validate(): { input: LfgInput } | { errors: FieldErrors } {
        const next: FieldErrors = {};
        const trimmed = text().trim();

        if (!trimmed) next.text = "Tell people what you're looking for";
        else if (trimmed.length > MAX_TEXT) next.text = `Keep it under ${MAX_TEXT} characters`;

        if (!Number.isInteger(slots()) || slots() < 1 || slots() > MAX_SLOTS) {
            next.slots = `Choose between 1 and ${MAX_SLOTS} slots`;
        }

        let expiresAt: Date | null = null;
        if (isInvalidExpiry()) {
            next.expiresAt = "Expiry must be at least 30 minutes in the future";
        }
        else 
            expiresAt = epochExpiry() ? new Date(epochExpiry()!) : null

        if (Object.keys(next).length) return { errors: next };
        return {
            input: {
                text: trimmed,
                gameId: game()?.gameId ?? null,
                slots: slots(),
                expiresAt,
            },
        };
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (pending()) return;

        setFormError("");
        const result = validate();
        if ("errors" in result) {
            setErrors(result.errors);
            return;
        }
        setErrors({});

        setPending(true);
        try {
            await createSquadFn(result.input);
            navigate(paths.squads())

        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Something went wrong. Try again.");
        } finally {
            setPending(false);
        }
    }

    return (
        <form class={["form", "card", styles.form]} onSubmit={handleSubmit} novalidate>
            <div class="field">
                <label>Game (optional)</label>
                <SearchAutocomplete
                    label="Game"
                    search={(str: string) => getGamesFn({ title: str })}
                    getLabel={g => g.title}
                    onSelect={g => setGame(g)}
                    placeholder="Search for a game"
                />
            </div>

            <div class="field">
                <label for="lfg-text">Description</label>
                <textarea
                    id="lfg-text"
                    rows={3}
                    maxlength={MAX_TEXT}
                    placeholder="Ranked grind tonight, mics on, chill vibes"
                    value={text()}
                    onInput={e => setText(e.currentTarget.value)}
                    aria-invalid={errors().text ? "true" : undefined}
                    aria-describedby="lfg-text-hint"
                />
                <div class={styles.hint} id="lfg-text-hint">
                    <Show when={errors().text} fallback={<span />}>
                        <span class={styles.error}>{errors().text}</span>
                    </Show>
                    <span>{text().length}/{MAX_TEXT}</span>
                </div>
            </div>

            <div class="field">
                <label for="lfg-slots">Open slots (not counting you)</label>
                <input
                    id="lfg-slots"
                    type="number"
                    min={1}
                    max={MAX_SLOTS}
                    step={1}
                    inputmode="numeric"
                    value={slots()}
                    onInput={e => setSlots(e.currentTarget.valueAsNumber)}
                    aria-invalid={errors().slots ? "true" : undefined}
                />
                <Show when={errors().slots}>
                    <span class={styles.error}>{errors().slots}</span>
                </Show>
            </div>

            <fieldset class={styles.expiry}>
                <legend>Expires (optional)</legend>
                <div class={styles.expiryRow}>
                    <div class="field">
                        <label for="lfg-expiry">Date and time</label>
                        <input
                            id="lfg-expiry"
                            type="datetime-local"
                            value={expiry.datetime}
                            onInput={e => setExpiry(s => {s.datetime = e.currentTarget.value})}
                            aria-invalid={errors().expiresAt ? "true" : undefined}
                        />
                    </div>
                    <div class="field">
                        <label for="lfg-timezone">Time zone</label>
                        <select
                            id="lfg-timezone"
                            value={expiry.timeZone}
                            onChange={e => setExpiry(s => {s.timeZone = e.currentTarget.value})}
                        >
                            <For each={timeZones()}>
                                {zone => (
                                    <option value={zone} selected={zone === expiry.timeZone}>
                                        {zone.replaceAll("_", " ")}
                                    </option>
                                )}
                            </For>
                        </select>
                    </div>
                </div>
                <Show when={errors().expiresAt}>
                    <span class={styles.error}>{errors().expiresAt}</span>
                </Show>
                <Show when={!expiry.datetime}>
                    <span class={styles.hint}>Leave empty to keep the post open until you close it.</span>
                </Show>
            </fieldset>

            <Show when={formError()}>
                <p class={styles.error} role="alert">{formError()}</p>
            </Show>
            <button
                type="submit"
                class="primary"
                disabled={pending()}
            >
                {pending() ? "Posting…" : "Post LFG"}
            </button>
        </form>
    );
}