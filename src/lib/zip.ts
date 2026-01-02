export function zip<T, V>(array1: T[], array2: V[]): [T, V][] {
    if (array1.length !== array2.length) {
        throw new Error("Arrays must have the same length");
    }
    return array1.map((item, i) => [item, array2[i]]);
}

export function mergeObjectArrays<T extends object, V extends object>(array1: T[], array2: V[]) {
    if (array1.length !== array2.length) {
        throw new Error("Arrays must have the same length");
    }
    return array1.map((item, i) => ({
        ...item,
        ...array2[i]
    }))
}