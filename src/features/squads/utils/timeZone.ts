export const FALLBACK_TIME_ZONE = "UTC";
export const MAX_TEXT = 255;
export const MAX_SLOTS = 12;

/* ───────── Time zone helpers ───────── */

export function isValidTimeZone(timeZone: string) {
    try {
        new Intl.DateTimeFormat(undefined, { timeZone });
        return true;
    } catch {
        return false;
    }
}

export function detectTimeZone() {
    try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return detected && isValidTimeZone(detected) ? detected : FALLBACK_TIME_ZONE;
    } catch {
        return FALLBACK_TIME_ZONE;
    }
}

export function listTimeZones(detected: string) {
    const supported: string[] =
        typeof (Intl as any).supportedValuesOf === "function"
            ? (Intl as any).supportedValuesOf("timeZone")
            : [];
    const rest = new Set([detected, ...supported]);
    rest.delete(FALLBACK_TIME_ZONE);
    return [FALLBACK_TIME_ZONE, ...[...rest].sort()];
}

/** Offset (zone wall-clock minus UTC) in ms at the given instant */
export function offsetMs(utcMs: number, timeZone: string) {
    const parts = new Intl.DateTimeFormat("en-ZA", {
        timeZone,
        hourCycle: "h23",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    }).formatToParts(new Date(utcMs));
    const get = (type: string) => Number(parts.find(p => p.type === type)!.value);
    const wallAsUtc = Date.UTC(
        get("year"),
        get("month") - 1,
        get("day"),
        get("hour"),
        get("minute"),
        get("second"),
    );
    return wallAsUtc - utcMs;
}

/** Interprets a `datetime-local` value as wall-clock time in `timeZone` and returns the instant */
export function zonedLocalToUtc(local: string, timeZone: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(local);
    if (!match) return null;
    const [y, mo, d, h, mi] = match.slice(1).map(Number);
    const wallAsUtc = Date.UTC(y, mo - 1, d, h, mi);
    // two passes so times near a DST change resolve against the right offset
    const firstGuess = wallAsUtc - offsetMs(wallAsUtc, timeZone);
    const instant = wallAsUtc - offsetMs(firstGuess, timeZone);
    return new Date(instant);
}