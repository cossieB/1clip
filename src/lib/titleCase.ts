export default function (str: string) {
    if (!str) return '';

    const lowercaseWords = new Set(['of', 'the', 'an', 'a', 'in', 'and', 'to', 'for', 'with', 'on', 'at', 'by']);

    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]+/g, ' ')
        .split(/\s+/)
        .map((word, index) => {
            const lower = word.toLowerCase();
            if (index > 0 && lowercaseWords.has(lower)) {
                return lower;
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}
