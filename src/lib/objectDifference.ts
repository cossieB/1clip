export function objectDifference<T extends {}>(newObj: T, oldObj: T) {
    const obj: Partial<T> = {}
    for (const key in newObj) {
        const oldVal = oldObj[key]
        const newVal = newObj[key]
        if (oldVal != null && typeof oldVal === 'object') continue
        if (oldVal === newVal) continue
        obj[key] = newVal
    }
    return obj
}