export function formatDateForInputElement(date: Date) {
    let year = date.getFullYear();

    let month = `0${date.getMonth() + 1}`;
    if (month.length > 2) month = month.slice(1);

    let day = `0${date.getDate()}`;
    if (day.length > 2) day = day.slice(1);

    return `${year}-${month}-${day}`;
}
export function formatDate(input: Date): string;
export function formatDate(input: string): string
export function formatDate(input: Date | string) {
    if (typeof input == 'string') {
        let date = new Date(input)
        let str = date.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'medium' })
        return str
    }
    return input.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'medium' })
}


export function formatIsoDate(isoString: string) {
    if (typeof Temporal === 'undefined') {
        return isoString;
    }

    try {
        const date = isoString.includes('T')
            ? Temporal.Instant.from(isoString).toZonedDateTimeISO('UTC')
            : Temporal.PlainDate.from(isoString);

        return date.toLocaleString('en-za', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return isoString;
    }
}
